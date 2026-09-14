/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_NATIVE_RASTER_H
#define AWTS_MERKAVA_NATIVE_RASTER_H

#include "merkava_native_layout.h"

#include <stddef.h>
#include <stdint.h>

/** Mutable BGRA8-compatible CPU surface owned by the executor presenter. */
typedef struct AwtsNativeSurface {
	uint32_t* pixels;
	uint32_t width;
	uint32_t height;
} AwtsNativeSurface;

/** Rasterizes retained boxes/text into an already allocated CPU pixel surface. */
int awts_native_raster_layout(
	const AwtsNativeLayout* layout,
	AwtsNativeSurface* surface
);

/** Computes a deterministic 64-bit FNV-1a hash over rasterized pixel bytes. */
uint64_t awts_native_surface_hash(const AwtsNativeSurface* surface);

/** Fills one clipped rectangle with an executor color. */
void awts_native_fill_rect(
	AwtsNativeSurface* surface,
	int x,
	int y,
	int width,
	int height,
	AwtsNativeColor color
);

/** Draws one bounded UTF-8 slice using the executor-owned bitmap fallback. */
void awts_native_draw_text(
	AwtsNativeSurface* surface,
	int x,
	int y,
	AwtsNativeSlice text,
	AwtsNativeColor color
);

#endif
