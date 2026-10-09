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
 */

#define AWTS_TEXT_ATLAS_W 1024
#define AWTS_TEXT_ATLAS_H 1024
#define AWTS_TEXT_CACHE_SLOTS 4096
#define AWTS_TEXT_FONT_COUNT 4

typedef struct {
	uint64_t key; /* (font<<48)|(glyph<<16)|px */
	int ax, ay;   /* atlas position */
	int w, h;     /* bitmap size */
	int bx, by;   /* bearings (px, y-down from pen) */
	float adv;    /* advance (px) */
	int used;
} AwtsTextCacheEntry;

typedef struct {
	AwtsTtfFace face;
	uint8_t* fileBytes; /* owned */
} AwtsLoadedFont;

typedef struct AwtsTextRenderer {
	GLuint program;
	GLuint vbo;
	GLuint texture;
	GLint uResolution;
	GLint uColor;
	float* verts;
	size_t vertCount;
	size_t vertCap;
	float curR, curG, curB;
	int vpW, vpH;
	int ok;

	/* Fonts: 0=regular 1=bold 2=hebrew 3=hebrew-bold. */
	AwtsLoadedFont fonts[AWTS_TEXT_FONT_COUNT];
	int nFonts;

	AwtsTextCacheEntry cache[AWTS_TEXT_CACHE_SLOTS];
	int shelfX, shelfY, shelfH;
	uint8_t* scratch; /* glyph raster scratch (1MB) */
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

/** Flushes queued glyphs to the surface. */
void awts_text_end(AwtsTextRenderer* tr);

/** Pixel width of UTF-8 text at the given scale. */
float awts_text_width(const char* text, float scale);
float awts_text_width_bold(const char* text, float scale);

/** Pixel width of the first len bytes of UTF-8 text. */
float awts_text_width_n(const char* text, size_t len, float scale);
float awts_text_width_n_bold(const char* text, size_t len, float scale);

#endif
