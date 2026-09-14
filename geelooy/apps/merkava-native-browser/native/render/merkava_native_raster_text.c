/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_raster.h"
#include "merkava_native_glyphs.h"

/** Returns the bounded UTF-8 byte span for one leading byte. */
static uint32_t utf8_span(uint8_t byte) {
	if ((byte & 0x80u) == 0u) {
		return 1u;
	}
	if ((byte & 0xe0u) == 0xc0u) {
		return 2u;
	}
	if ((byte & 0xf0u) == 0xe0u) {
		return 3u;
	}
	if ((byte & 0xf8u) == 0xf0u) {
		return 4u;
	}
	return 1u;
}

/** Draws one 5x7 glyph with a fixed two-pixel executor scale. */
static void draw_glyph(
	AwtsNativeSurface* surface,
	int x,
	int y,
	const uint8_t* rows,
	AwtsNativeColor color
) {
	const int scale = 2;
	for (int row = 0; row < 7; row += 1) {
		for (int column = 0; column < 5; column += 1) {
			uint8_t mask = (uint8_t)(1u << (4 - column));
			if (rows[row] & mask) {
				awts_native_fill_rect(
					surface,
					x + column * scale,
					y + row * scale,
					scale,
					scale,
					color
				);
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
	uint32_t at = 0;
	int penX = x;
	while (at < text.length) {
		uint8_t leading = text.bytes[at];
		uint32_t span = utf8_span(leading);
		uint8_t glyph = leading;
		if (span > text.length - at) {
			span = 1u;
			glyph = '?';
		} else if (span > 1u) {
			glyph = '?';
		}
		draw_glyph(
			surface,
			penX,
			y,
			awts_native_ascii_glyph(glyph),
			color
		);
		penX += 12;
		at += span;
	}
}
