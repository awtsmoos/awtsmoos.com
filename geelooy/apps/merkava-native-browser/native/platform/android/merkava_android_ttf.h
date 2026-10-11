/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_ANDROID_TTF_H
#define AWTS_MERKAVA_ANDROID_TTF_H

#include <stddef.h>
#include <stdint.h>

/*
 * Minimal TrueType parser + scanline rasterizer.
 *
 * Loads a .ttf from a file path (device fonts live in /system/fonts),
 * maps Unicode codepoints to glyph indices via cmap (format 4 and 12),
 * extracts quadratic outlines from glyf (simple + composite), and
 * rasterizes glyphs to 8-bit coverage bitmaps with 4x4 supersampling.
 *
 * No third-party code. No heap churn in the render path: the caller owns
 * a scratch buffer reused across glyphs.
 */

/* One parsed TrueType face. fileBytes must outlive the face (caller-owned). */
typedef struct AwtsTtfFace {
	const uint8_t* data;   /* Whole file. */
	size_t len;

	/* Table pointers (NULL when absent). */
	const uint8_t* head;
	const uint8_t* maxp;
	const uint8_t* hhea;
	const uint8_t* hmtx;
	const uint8_t* cmap;
	const uint8_t* loca;
	const uint8_t* glyf;

	uint16_t unitsPerEm;
	uint16_t numGlyphs;
	uint16_t numHMetrics;
	int locaLong;           /* indexToLocFormat != 0 */

	int ok;
} AwtsTtfFace;

/* Parses the TTF in data[0..len). Does not copy; data must stay alive. */
int awts_ttf_parse(const uint8_t* data, size_t len, AwtsTtfFace* out);
void awts_ttf_free(AwtsTtfFace* face); /* releases nothing but clears state */

/* Unicode codepoint -> glyph index (0 when missing). */
uint16_t awts_ttf_glyph_index(const AwtsTtfFace* face, uint32_t codepoint);

/* Horizontal advance in font units (0 when missing). */
int awts_ttf_advance(const AwtsTtfFace* face, uint16_t glyph);

/*
 * Rasterizes a glyph to an 8-bit coverage bitmap.
 *
 * pixelHeight: desired glyph pixel height (em box). Width is derived.
 * out: caller buffer of at least outW*outH bytes; receives coverage 0..255.
 * Returns the bitmap size in outW/outH and the glyph metrics:
 *   bearingX/bearingY: offset from pen origin to bitmap top-left (pixels).
 *   advance: horizontal advance in pixels (float, for subpixel-accurate layout).
 *
 * outStride may exceed outW for alignment; pass 0 for packed rows.
 * Returns 1 on success, 0 when the glyph is empty or missing.
 */
int awts_ttf_rasterize(const AwtsTtfFace* face, uint16_t glyph, int pixelHeight,
	uint8_t* out, int outStride,
	int* outW, int* outH, int* bearingX, int* bearingY, float* advance);

/* Convenience: file -> malloc'd bytes. Returns NULL on failure. */
uint8_t* awts_ttf_read_file(const char* path, size_t* outLen);

#endif
