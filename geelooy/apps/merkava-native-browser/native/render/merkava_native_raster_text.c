/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_raster.h"
#include "merkava_native_glyphs.h"

/*
 * B"H (2026-10-09): Extreme text optimization.
 *
 * The old draw_glyph called awts_native_fill_rect once per SET PIXEL
 * (up to 35 function calls per glyph, each redoing full clipping math).
 * This rewrite:
 *  - packs the color once per draw_text call,
 *  - clips the 10x14 glyph box once (fast path: fully inside, no clipping),
 *  - stamps 2x2 pixel blocks with unrolled direct writes (no calls),
 *  - uses an ASCII fast path in the main loop (no utf8_span branch).
 * Semantics (pixels, advance, '?' fallback) are unchanged.
 */

/** Glyph metrics for the fixed 5x7-at-2x fallback font. */
#define FALLBACK_SCALE 2
#define FALLBACK_GW (5 * FALLBACK_SCALE)
#define FALLBACK_GH (7 * FALLBACK_SCALE)
#define FALLBACK_ADVANCE 12

/** Packs RGBA channels so little-endian memory is BGRA8 for Metal textures. */
static uint32_t pack_bgra_fast(AwtsNativeColor color) {
	return ((uint32_t)color.alpha << 24)
		| ((uint32_t)color.red << 16)
		| ((uint32_t)color.green << 8)
		| (uint32_t)color.blue;
}

/*
 * Draws one 5x7 glyph at 2x scale. Fast path assumes the 10x14 box is
 * fully inside the surface; the caller guarantees it via clip_glyph.
 */
static void stamp_glyph_inside(
	uint32_t* pixels,
	uint32_t stride,
	int x,
	int y,
	const uint8_t* rows,
	uint32_t packed
) {
	for (int row = 0; row < 7; row += 1) {
		uint8_t bits = rows[row];
		if (!bits) {
			continue;
		}
		uint32_t* d0 = pixels + (size_t)(y + row * 2) * stride + (size_t)x;
		uint32_t* d1 = d0 + stride;
		/* Unrolled 2x2 stamps, one per set column. */
		if (bits & 0x10u) {
			d0[0] = packed; d0[1] = packed;
			d1[0] = packed; d1[1] = packed;
		}
		if (bits & 0x08u) {
			d0[2] = packed; d0[3] = packed;
			d1[2] = packed; d1[3] = packed;
		}
		if (bits & 0x04u) {
			d0[4] = packed; d0[5] = packed;
			d1[4] = packed; d1[5] = packed;
		}
		if (bits & 0x02u) {
			d0[6] = packed; d0[7] = packed;
			d1[6] = packed; d1[7] = packed;
		}
		if (bits & 0x01u) {
			d0[8] = packed; d0[9] = packed;
			d1[8] = packed; d1[9] = packed;
		}
	}
}

/* Clipped glyph draw: per-column/per-row clipping, still no function calls. */
static void stamp_glyph_clipped(
	AwtsNativeSurface* surface,
	int x,
	int y,
	const uint8_t* rows,
	uint32_t packed
) {
	int sw = (int)surface->width;
	int sh = (int)surface->height;
	uint32_t* pixels = surface->pixels;
	for (int row = 0; row < 7; row += 1) {
		uint8_t bits = rows[row];
		if (!bits) {
			continue;
		}
		int py = y + row * 2;
		for (int dy = 0; dy < 2; dy += 1) {
			int yy = py + dy;
			if (yy < 0 || yy >= sh) {
				continue;
			}
			uint32_t* dst = pixels + (size_t)yy * (size_t)sw;
			if (bits & 0x10u) {
				if (x + 0 >= 0 && x + 0 < sw) dst[x + 0] = packed;
				if (x + 1 >= 0 && x + 1 < sw) dst[x + 1] = packed;
			}
			if (bits & 0x08u) {
				if (x + 2 >= 0 && x + 2 < sw) dst[x + 2] = packed;
				if (x + 3 >= 0 && x + 3 < sw) dst[x + 3] = packed;
			}
			if (bits & 0x04u) {
				if (x + 4 >= 0 && x + 4 < sw) dst[x + 4] = packed;
				if (x + 5 >= 0 && x + 5 < sw) dst[x + 5] = packed;
			}
			if (bits & 0x02u) {
				if (x + 6 >= 0 && x + 6 < sw) dst[x + 6] = packed;
				if (x + 7 >= 0 && x + 7 < sw) dst[x + 7] = packed;
			}
			if (bits & 0x01u) {
				if (x + 8 >= 0 && x + 8 < sw) dst[x + 8] = packed;
				if (x + 9 >= 0 && x + 9 < sw) dst[x + 9] = packed;
			}
		}
	}
}

/** Draws one bounded UTF-8 slice using executor-owned fallback glyph pixels. */
void awts_native_draw_text(
	AwtsNativeSurface* surface,
	int x,
	int y,
	AwtsNativeSlice text,
	AwtsNativeColor color
) {
	uint32_t packed;
	int sw;
	int sh;
	uint32_t at;
	int penX;

	if (!surface || !surface->pixels || !text.bytes || text.length == 0) {
		return;
	}
	packed = pack_bgra_fast(color);
	sw = (int)surface->width;
	sh = (int)surface->height;
	at = 0;
	penX = x;
	while (at < text.length) {
		uint8_t leading = text.bytes[at];
		const uint8_t* rows;
		int gx1;
		int gy1;
		if (leading < 0x80u) {
			/* ASCII fast path: no utf8_span, direct glyph fetch. */
			rows = awts_native_ascii_glyph(leading);
			at += 1;
		} else {
			/* Multibyte: same '?' fallback semantics as before. */
			uint32_t span;
			if ((leading & 0xe0u) == 0xc0u) {
				span = 2u;
			} else if ((leading & 0xf0u) == 0xe0u) {
				span = 3u;
			} else if ((leading & 0xf8u) == 0xf0u) {
				span = 4u;
			} else {
				span = 1u;
			}
			if (span > text.length - at) {
				span = 1u;
			}
			rows = awts_native_ascii_glyph('?');
			at += span;
		}
		gx1 = penX + FALLBACK_GW;
		gy1 = y + FALLBACK_GH;
		if (penX >= 0 && y >= 0 && gx1 <= sw && gy1 <= sh) {
			stamp_glyph_inside(
				surface->pixels, surface->width, penX, y, rows, packed);
		} else if (gx1 > 0 && gy1 > 0 && penX < sw && y < sh) {
			stamp_glyph_clipped(surface, penX, y, rows, packed);
		}
		penX += FALLBACK_ADVANCE;
	}
}
