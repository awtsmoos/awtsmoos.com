/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_ANDROID_TEXT_H
#define AWTS_MERKAVA_ANDROID_TEXT_H

#include <GLES3/gl3.h>
#include <stddef.h>
#include <stdint.h>

#include "merkava_android_ttf.h"

/*
 * GLES3 TrueType text renderer.
 *
 * Loads real device fonts from /system/fonts (Roboto, NotoSansHebrew),
 * rasterizes glyphs with 4x-supersampled coverage, caches them in a
 * dynamic GPU atlas, and batches quads. Full UTF-8 (Hebrew included).
 * No DOM/CSS rules live here.
 *
 * MEMORY DESIGN (B"H — every byte used):
 * - Glyph cache entry packed to 24 bytes (was 40): coords are int16
 *   (atlas is 1024x1024, glyphs capped at 512px), key==0 means unused
 *   (px is always >= 4 so a zero key can never be valid).
 * - Vertex batch buffer starts at 1024 quads (96KB) and grows on demand
 *   (was a fixed 768KB upfront).
 * - Glyph raster scratch is 256KB (was 1MB); the TTF rasterizer caps
 *   glyphs at 512px so 512*512 is the hard maximum.
 * - Hebrew fonts load lazily on first Hebrew codepoint (was: all four
 *   fonts eagerly at init, ~800KB of NotoSansHebrew for Latin-only pages).
 */

#define AWTS_TEXT_ATLAS_W 1024
#define AWTS_TEXT_ATLAS_H 1024
#define AWTS_TEXT_CACHE_SLOTS 4096
#define AWTS_TEXT_FONT_COUNT 4

/* Max rasterized glyph dimension (px). The TTF layer enforces this. */
#define AWTS_TEXT_MAX_GLYPH_PX 512
/* Scratch must hold the largest possible glyph bitmap. */
#define AWTS_TEXT_SCRATCH_SIZE (AWTS_TEXT_MAX_GLYPH_PX * AWTS_TEXT_MAX_GLYPH_PX)

/* Initial vertex batch capacity, in quads (grows on demand). */
#define AWTS_TEXT_VERT_QUADS_INIT 1024
/* Hard cap on vertex batch, in quads (matches old fixed size). */
#define AWTS_TEXT_VERT_QUADS_MAX 8192

typedef struct {
	uint64_t key; /* (font<<48)|(glyph<<16)|px; 0 = slot unused */
	int16_t ax, ay;   /* atlas position */
	int16_t w, h;     /* bitmap size */
	int16_t bx, by;   /* bearings (px, y-down from pen) */
	float adv;        /* advance (px) */
	/* 24 bytes total (was 40). */
} AwtsTextCacheEntry;

typedef struct {
	AwtsTtfFace face;
	uint8_t* fileBytes; /* owned */
	int loadAttempted;  /* 1 once we tried (so we never retry per glyph) */
	int lazy;           /* 1 = load on first use, not at init */
} AwtsLoadedFont;

typedef struct AwtsTextRenderer {
	GLuint program;
	GLuint vbo;
	GLuint texture;
	GLint uResolution;
	GLint uColor;
	float* verts;
	size_t vertCount;
	size_t vertCap;      /* in floats */
	float curR, curG, curB;
	int vpW, vpH;
	int ok;

	/* Fonts: 0=regular 1=bold 2=hebrew 3=hebrew-bold. */
	AwtsLoadedFont fonts[AWTS_TEXT_FONT_COUNT];
	int nFonts;

	AwtsTextCacheEntry cache[AWTS_TEXT_CACHE_SLOTS];
	int shelfX, shelfY, shelfH;
	uint8_t* scratch; /* glyph raster scratch (AWTS_TEXT_SCRATCH_SIZE) */

	/*
	 * B"H (2026-10-09): Extreme text optimization -- ASCII fast path.
	 *
	 * 95%+ of Latin text is ASCII. These tables eliminate per-character
	 * pick_font (cmap lookups) and cache_key hashing for ASCII:
	 * - asciiFont/asciiGlyph/asciiAdv: resolved once per (bold,px),
	 *   then O(1) per character. Built via pick_font so semantics match.
	 * - asciiEntry: lazy CacheEntry* per ASCII char (atlas UVs for draw).
	 *   Cleared on cache_reset (atlas overflow); metrics tables survive.
	 * - asciiPx: px the tables were built for; 0 = unbuilt.
	 */
	uint8_t asciiFont[2][128];
	uint16_t asciiGlyph[2][128];
	float asciiAdv[2][128];
	AwtsTextCacheEntry* asciiEntry[2][128];
	int asciiPx[2];

	/*
	 * B"H: Non-ASCII codepoint memo (direct-mapped, 64 entries per bold).
	 * Memoizes (cp,bold) -> (font, glyph) so repeated Hebrew chars skip
	 * pick_font. Stores cp+1 (0 = empty). 255 = missing glyph.
	 * Survives cache_reset (font/glyph mapping is atlas-independent).
	 */
	uint32_t cpMemoCp[2][64];
	uint16_t cpMemoGlyph[2][64];
	uint8_t cpMemoFont[2][64];
} AwtsTextRenderer;

int awts_text_init(AwtsTextRenderer* tr);
void awts_text_shutdown(AwtsTextRenderer* tr);

/** Starts a frame: sets viewport size for NDC mapping. */
void awts_text_begin(AwtsTextRenderer* tr, int vpW, int vpH);

/** Queues one line of UTF-8 text (regular weight). */
void awts_text_draw(AwtsTextRenderer* tr, float x, float y, float scale,
	float r, float g, float b, const char* text);

/** Queues one line of UTF-8 text (bold weight, for headings). */
void awts_text_draw_bold(AwtsTextRenderer* tr, float x, float y, float scale,
	float r, float g, float b, const char* text);

/** Length-delimited variants: no NUL needed, no temp copy. */
void awts_text_draw_n(AwtsTextRenderer* tr, float x, float y, float scale,
	float r, float g, float b, const char* text, size_t len);
void awts_text_draw_n_bold(AwtsTextRenderer* tr, float x, float y, float scale,
	float r, float g, float b, const char* text, size_t len);

/** Flushes queued glyphs to the surface. */
void awts_text_end(AwtsTextRenderer* tr);

/** Pixel width of UTF-8 text at the given scale. */
float awts_text_width(const char* text, float scale);
float awts_text_width_bold(const char* text, float scale);

/** Pixel width of the first len bytes of UTF-8 text (no temp copy). */
float awts_text_width_n(const char* text, size_t len, float scale);
float awts_text_width_n_bold(const char* text, size_t len, float scale);

#endif
