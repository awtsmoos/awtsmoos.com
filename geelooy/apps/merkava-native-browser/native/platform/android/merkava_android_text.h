/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_ANDROID_TEXT_H
#define AWTS_MERKAVA_ANDROID_TEXT_H

#include <GLES3/gl3.h>

/** GLES3 bitmap-font text renderer. No DOM/CSS rules live here. */
typedef struct AwtsTextRenderer {
	GLuint program;
	GLuint vbo;
	GLuint texture;
	GLint uResolution;
	GLint uColor;
	GLint aPos;
	GLint aUV;
	float* verts;       /* Accumulated quads: x,y,u,v per vertex. */
	size_t vertCount;
	size_t vertCap;
	float curR, curG, curB; /* Active batch color; -1 forces first set. */
	int vpW, vpH;
	int ok;
} AwtsTextRenderer;

int awts_text_init(AwtsTextRenderer* tr);
void awts_text_shutdown(AwtsTextRenderer* tr);

/** Starts a frame: sets viewport size for NDC mapping. */
void awts_text_begin(AwtsTextRenderer* tr, int vpW, int vpH);

/** Queues one line of text (ASCII 32..126; others render as space). */
void awts_text_draw(AwtsTextRenderer* tr, float x, float y, float scale,
	float r, float g, float b, const char* text);

/** Flushes queued glyphs to the surface. */
void awts_text_end(AwtsTextRenderer* tr);

/** Pixel width of text at the given scale (8px per glyph * scale). */
float awts_text_width(const char* text, float scale);

#endif
