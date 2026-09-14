/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_raster.h"

/** Packs RGBA channels so little-endian memory is BGRA8 for Metal textures. */
static uint32_t pack_bgra(AwtsNativeColor color) {
	return ((uint32_t)color.alpha << 24)
		| ((uint32_t)color.red << 16)
		| ((uint32_t)color.green << 8)
		| (uint32_t)color.blue;
}

/** Fills one clipped rectangle with an executor color. */
void awts_native_fill_rect(
	AwtsNativeSurface* surface,
	int x,
	int y,
	int width,
	int height,
	AwtsNativeColor color
) {
	int left;
	int top;
	int right;
	int bottom;
	uint32_t packed;
	if (!surface || !surface->pixels || width <= 0 || height <= 0) {
		return;
	}
	left = x < 0 ? 0 : x;
	top = y < 0 ? 0 : y;
	right = x + width > (int)surface->width ? (int)surface->width : x + width;
	bottom = y + height > (int)surface->height ? (int)surface->height : y + height;
	packed = pack_bgra(color);
	for (int row = top; row < bottom; row += 1) {
		uint32_t* pixels = surface->pixels + (size_t)row * surface->width;
		for (int column = left; column < right; column += 1) {
			pixels[column] = packed;
		}
	}
}

/** Computes a deterministic 64-bit FNV-1a hash over rasterized pixel bytes. */
uint64_t awts_native_surface_hash(const AwtsNativeSurface* surface) {
	const uint8_t* bytes;
	size_t length;
	uint64_t hash = UINT64_C(1469598103934665603);
	if (!surface || !surface->pixels) {
		return 0;
	}
	bytes = (const uint8_t*)surface->pixels;
	length = (size_t)surface->width * surface->height * sizeof(uint32_t);
	for (size_t index = 0; index < length; index += 1) {
		hash ^= bytes[index];
		hash *= UINT64_C(1099511628211);
	}
	return hash;
}
