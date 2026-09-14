/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_raster.h"

/** Draws one retained box background and its text into the CPU surface. */
static void raster_box(
	const AwtsNativeBox* box,
	AwtsNativeSurface* surface
) {
	if (!box || !surface) {
		return;
	}
	awts_native_fill_rect(
		surface,
		(int)box->x,
		(int)box->y,
		(int)box->width,
		(int)box->height,
		box->background
	);
	if (box->text.length) {
		awts_native_draw_text(
			surface,
			(int)(box->x + box->padding),
			(int)(box->y + box->padding),
			box->text,
			box->foreground
		);
	}
}

/** Rasterizes retained boxes/text into an already allocated CPU pixel surface. */
int awts_native_raster_layout(
	const AwtsNativeLayout* layout,
	AwtsNativeSurface* surface
) {
	AwtsNativeColor page = { 255u, 255u, 255u, 255u };
	if (!layout || !surface || !surface->pixels) {
		return 0;
	}
	if (!surface->width || !surface->height) {
		return 0;
	}
	awts_native_fill_rect(
		surface,
		0,
		0,
		(int)surface->width,
		(int)surface->height,
		page
	);
	for (uint32_t index = 0; index < layout->boxCount; index += 1) {
		raster_box(&layout->boxes[index], surface);
	}
	return 1;
}
