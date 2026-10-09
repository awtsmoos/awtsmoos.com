/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_android_text.h"
#include "merkava_android_ttf.h"

#include <stdlib.h>
#include <string.h>

/* ------------------------------------------------------------------ */
/* Shaders (same quad-batching pipeline as before)                    */
/* ------------------------------------------------------------------ */

static const char* VERT_SRC =
	"#version 300 es\n"
	"layout(location = 0) in vec2 aPos;\n"
	"layout(location = 1) in vec2 aUV;\n"
	"uniform vec2 uResolution;\n"
	"out vec2 vUV;\n"
	"void main() {\n"
	"  vec2 ndc = vec2((aPos.x / uResolution.x) * 2.0 - 1.0,\n"
	"                   1.0 - (aPos.y / uResolution.y) * 2.0);\n"
	"  gl_Position = vec4(ndc, 0.0, 1.0);\n"
	"  vUV = aUV;\n"
	"}\n";

static const char* FRAG_SRC =
	"#version 300 es\n"
	"precision mediump float;\n"
	"in vec2 vUV;\n"
	"uniform sampler2D uAtlas;\n"
	"uniform vec3 uColor;\n"
	"out vec4 oColor;\n"
	"void main() {\n"
	"  float a = texture(uAtlas, vUV).r;\n"
	"  if (a < 0.004) discard;\n"
	"  oColor = vec4(uColor, a);\n"
	"}\n";

/* ------------------------------------------------------------------ */
/* Font slots                                                         */
/* ------------------------------------------------------------------ */

#define FONT_REGULAR 0
#define FONT_BOLD 1
#define FONT_HEBREW 2
#define FONT_HEBREW_BOLD 3

#define ATLAS_W AWTS_TEXT_ATLAS_W
#define ATLAS_H AWTS_TEXT_ATLAS_H
#define CACHE_SLOTS AWTS_TEXT_CACHE_SLOTS
#define FONT_COUNT AWTS_TEXT_FONT_COUNT

typedef AwtsLoadedFont LoadedFont;
typedef AwtsTextCacheEntry CacheEntry;

static const char* FONT_PATHS[FONT_COUNT][3] = {
	{ "/system/fonts/Roboto-Regular.ttf", "/system/fonts/DejaVuSans.ttf", NULL },
	{ "/system/fonts/Roboto-Bold.ttf", "/system/fonts/DejaVuSans-Bold.ttf", NULL },
	{ "/system/fonts/NotoSansHebrew-Regular.ttf", NULL, NULL },
	{ "/system/fonts/NotoSansHebrew-Bold.ttf", NULL, NULL },
};

/* Process-wide active renderer for width measurement (single-renderer app). */
static AwtsTextRenderer* g_last_tr = NULL;

/* ------------------------------------------------------------------ */
/* UTF-8                                                              */
/* ------------------------------------------------------------------ */

static uint32_t utf8_next(const char** pp) {
	const unsigned char* p = (const unsigned char*)*pp;
	uint32_t cp;
	if (p[0] < 0x80) { cp = p[0]; *pp += 1; }
	else if ((p[0] & 0xE0) == 0xC0 && p[1]) {
		cp = ((uint32_t)(p[0] & 0x1F) << 6) | (p[1] & 0x3F); *pp += 2;
	} else if ((p[0] & 0xF0) == 0xE0 && p[1] && p[2]) {
		cp = ((uint32_t)(p[0] & 0x0F) << 12) | ((uint32_t)(p[1] & 0x3F) << 6) |
		     (p[2] & 0x3F); *pp += 3;
	} else if ((p[0] & 0xF8) == 0xF0 && p[1] && p[2] && p[3]) {
		cp = ((uint32_t)(p[0] & 0x07) << 18) | ((uint32_t)(p[1] & 0x3F) << 12) |
		     ((uint32_t)(p[2] & 0x3F) << 6) | (p[3] & 0x3F); *pp += 4;
	} else { cp = 0xFFFD; *pp += 1; }
	return cp;
}

static int is_hebrew(uint32_t cp) {
	return (cp >= 0x0590 && cp <= 0x05FF) || (cp >= 0xFB1D && cp <= 0xFB4F);
}

/* ------------------------------------------------------------------ */
/* Font selection                                                     */
/* ------------------------------------------------------------------ */

static int pick_font(AwtsTextRenderer* tr, uint32_t cp, int bold,
		uint16_t* outGlyph) {
	int order[FONT_COUNT];
	int n = 0;
	if (is_hebrew(cp)) {
		order[n++] = bold ? FONT_HEBREW_BOLD : FONT_HEBREW;
		order[n++] = bold ? FONT_HEBREW : FONT_HEBREW_BOLD;
	}
	order[n++] = bold ? FONT_BOLD : FONT_REGULAR;
	order[n++] = bold ? FONT_REGULAR : FONT_BOLD;
	/* Last resort: any loaded font with the glyph. */
	for (int i = 0; i < FONT_COUNT; i++) {
		int dup = 0;
		for (int j = 0; j < n; j++) if (order[j] == i) { dup = 1; break; }
		if (!dup) order[n++] = i;
	}
	for (int i = 0; i < n; i++) {
		LoadedFont* lf = &tr->fonts[order[i]];
		if (!lf->face.ok) continue;
		uint16_t g = awts_ttf_glyph_index(&lf->face, cp);
		if (g) { *outGlyph = g; return order[i]; }
	}
	return -1;
}

/* ------------------------------------------------------------------ */
/* Glyph cache                                                        */
/* ------------------------------------------------------------------ */

static uint64_t cache_key(int font, uint16_t glyph, int px) {
	return ((uint64_t)(uint32_t)font << 48) |
	       ((uint64_t)glyph << 16) | (uint64_t)(uint32_t)px;
}

static void cache_reset(AwtsTextRenderer* tr) {
	memset(tr->cache, 0, sizeof(tr->cache));
	tr->shelfX = 0; tr->shelfY = 0; tr->shelfH = 0;
}

static CacheEntry* cache_lookup(AwtsTextRenderer* tr, uint64_t key) {
	size_t mask = CACHE_SLOTS - 1;
	size_t i = (size_t)(key * 11400714819323198485ull) & mask;
	for (size_t n = 0; n < CACHE_SLOTS; n++) {
		CacheEntry* e = &tr->cache[i];
		if (!e->used) return NULL;
		if (e->key == key) return e;
		i = (i + 1) & mask;
	}
	return NULL;
}

static CacheEntry* cache_insert(AwtsTextRenderer* tr, uint64_t key) {
	size_t mask = CACHE_SLOTS - 1;
	size_t i = (size_t)(key * 11400714819323198485ull) & mask;
	for (size_t n = 0; n < CACHE_SLOTS; n++) {
		CacheEntry* e = &tr->cache[i];
		if (!e->used || e->key == key) {
			e->used = 1; e->key = key;
			return e;
		}
		i = (i + 1) & mask;
	}
	return NULL; /* table full (should not happen with reset) */
}

/*
 * Rasterizes a glyph into the atlas; returns the cache entry.
 * Atlas uses shelf packing; on overflow the whole cache resets.
 */
static CacheEntry* cache_glyph(AwtsTextRenderer* tr, int font, uint16_t glyph,
		int px) {
	uint64_t key = cache_key(font, glyph, px);
	CacheEntry* e = cache_lookup(tr, key);
	if (e) return e;

	LoadedFont* lf = &tr->fonts[font];
	int w, h, bx, by; float adv;
	if (!awts_ttf_rasterize(&lf->face, glyph, px, tr->scratch, 0,
			&w, &h, &bx, &by, &adv)) {
		/* Empty glyph (e.g. space): cache metrics with zero bitmap. */
		int au = awts_ttf_advance(&lf->face, glyph);
		adv = au * ((float)px / (float)lf->face.unitsPerEm);
		e = cache_insert(tr, key);
		if (!e) return NULL;
		e->ax = e->ay = e->w = e->h = 0;
		e->bx = e->by = 0;
		e->adv = adv;
		return e;
	}
	if (w + 2 > ATLAS_W || h + 2 > ATLAS_H) return NULL;

	/* Shelf pack. */
	if (tr->shelfX + w + 2 > ATLAS_W) {
		tr->shelfY += tr->shelfH + 2;
		tr->shelfX = 0;
		tr->shelfH = 0;
	}
	if (tr->shelfY + h + 2 > ATLAS_H) {
		cache_reset(tr); /* atlas full: start over */
	}
	if (tr->shelfX + w + 2 > ATLAS_W || tr->shelfY + h + 2 > ATLAS_H)
		return NULL; /* single glyph too big even when empty */

	int ax = tr->shelfX + 1, ay = tr->shelfY + 1;
	glBindTexture(GL_TEXTURE_2D, tr->texture);
	glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
	for (int y = 0; y < h; y++) {
		glTexSubImage2D(GL_TEXTURE_2D, 0, ax, ay + y, w, 1,
			GL_RED, GL_UNSIGNED_BYTE, tr->scratch + (size_t)y * w);
	}
	glBindTexture(GL_TEXTURE_2D, 0);

	tr->shelfX += w + 2;
	if (h + 2 > tr->shelfH) tr->shelfH = h + 2;

	e = cache_insert(tr, key);
	if (!e) return NULL;
	e->ax = ax; e->ay = ay; e->w = w; e->h = h;
	e->bx = bx; e->by = by; e->adv = adv;
	return e;
}

/* ------------------------------------------------------------------ */
/* GL setup                                                           */
/* ------------------------------------------------------------------ */

static GLuint compile_shader(GLenum type, const char* src) {
	GLuint sh = glCreateShader(type);
	glShaderSource(sh, 1, &src, NULL);
	glCompileShader(sh);
	GLint ok = 0;
	glGetShaderiv(sh, GL_COMPILE_STATUS, &ok);
	if (!ok) { glDeleteShader(sh); return 0; }
	return sh;
}

static int load_one_font(LoadedFont* lf, const char* const* paths) {
	memset(lf, 0, sizeof(*lf));
	for (int i = 0; paths[i]; i++) {
		size_t len = 0;
		uint8_t* bytes = awts_ttf_read_file(paths[i], &len);
		if (!bytes) continue;
		AwtsTtfFace face;
		if (awts_ttf_parse(bytes, len, &face) && face.ok) {
			lf->face = face;
			lf->fileBytes = bytes;
			return 1;
		}
		free(bytes);
	}
	return 0;
}

int awts_text_init(AwtsTextRenderer* tr) {
	if (!tr) return 0;
	memset(tr, 0, sizeof(*tr));

	GLuint vs = compile_shader(GL_VERTEX_SHADER, VERT_SRC);
	GLuint fs = compile_shader(GL_FRAGMENT_SHADER, FRAG_SRC);
	if (!vs || !fs) { glDeleteShader(vs); glDeleteShader(fs); return 0; }
	tr->program = glCreateProgram();
	glAttachShader(tr->program, vs);
	glAttachShader(tr->program, fs);
	glBindAttribLocation(tr->program, 0, "aPos");
	glBindAttribLocation(tr->program, 1, "aUV");
	glLinkProgram(tr->program);
	glDeleteShader(vs);
	glDeleteShader(fs);
	GLint linked = 0;
	glGetProgramiv(tr->program, GL_LINK_STATUS, &linked);
	if (!linked) { glDeleteProgram(tr->program); return 0; }
	tr->uResolution = glGetUniformLocation(tr->program, "uResolution");
	tr->uColor = glGetUniformLocation(tr->program, "uColor");

	/* Device fonts. */
	tr->nFonts = 0;
	for (int i = 0; i < FONT_COUNT; i++) {
		if (load_one_font(&tr->fonts[i], FONT_PATHS[i]))
			tr->nFonts++;
	}
	if (tr->nFonts == 0) return 0; /* no fonts at all: fail loudly */

	/* Dynamic glyph atlas. */
	glGenTextures(1, &tr->texture);
	glBindTexture(GL_TEXTURE_2D, tr->texture);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_R8, ATLAS_W, ATLAS_H,
		0, GL_RED, GL_UNSIGNED_BYTE, NULL);
	glBindTexture(GL_TEXTURE_2D, 0);

	tr->scratch = (uint8_t*)malloc(1024 * 1024);
	if (!tr->scratch) { awts_text_shutdown(tr); return 0; }

	glGenBuffers(1, &tr->vbo);
	tr->vertCap = 8192 * 6 * 4;
	tr->verts = (float*)malloc(tr->vertCap * sizeof(float));
	if (!tr->verts) { awts_text_shutdown(tr); return 0; }
	cache_reset(tr);
	tr->ok = 1;
	g_last_tr = tr;
	return 1;
}

void awts_text_shutdown(AwtsTextRenderer* tr) {
	if (!tr) return;
	if (g_last_tr == tr) g_last_tr = NULL;
	free(tr->verts);
	tr->verts = NULL;
	free(tr->scratch);
	tr->scratch = NULL;
	for (int i = 0; i < FONT_COUNT; i++) {
		free(tr->fonts[i].fileBytes);
		tr->fonts[i].fileBytes = NULL;
		awts_ttf_free(&tr->fonts[i].face);
	}
	if (tr->vbo) glDeleteBuffers(1, &tr->vbo);
	if (tr->texture) glDeleteTextures(1, &tr->texture);
	if (tr->program) glDeleteProgram(tr->program);
	memset(tr, 0, sizeof(*tr));
}

void awts_text_begin(AwtsTextRenderer* tr, int vpW, int vpH) {
	if (!tr || !tr->ok) return;
	tr->vpW = vpW > 0 ? vpW : 1;
	tr->vpH = vpH > 0 ? vpH : 1;
	tr->vertCount = 0;
	tr->curR = tr->curG = tr->curB = -1.0f;
}

static void flush_quads(AwtsTextRenderer* tr) {
	if (!tr || !tr->ok || tr->vertCount == 0) return;
	glUseProgram(tr->program);
	glUniform2f(tr->uResolution, (float)tr->vpW, (float)tr->vpH);
	glUniform3f(tr->uColor, tr->curR, tr->curG, tr->curB);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, tr->texture);
	glBindBuffer(GL_ARRAY_BUFFER, tr->vbo);
	glBufferData(GL_ARRAY_BUFFER, tr->vertCount * sizeof(float),
		tr->verts, GL_DYNAMIC_DRAW);
	glEnableVertexAttribArray(0);
	glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE,
		4 * sizeof(float), (void*)0);
	glEnableVertexAttribArray(1);
	glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE,
		4 * sizeof(float), (void*)(2 * sizeof(float)));
	glDrawArrays(GL_TRIANGLES, 0, (GLsizei)(tr->vertCount / 4));
	glDisableVertexAttribArray(0);
	glDisableVertexAttribArray(1);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	tr->vertCount = 0;
}

static void push_vert(AwtsTextRenderer* tr, float x, float y, float u, float v) {
	if (tr->vertCount + 4 > tr->vertCap) return;
	float* p = tr->verts + tr->vertCount;
	p[0] = x; p[1] = y; p[2] = u; p[3] = v;
	tr->vertCount += 4;
}

static void draw_run(AwtsTextRenderer* tr, float x, float y, int px,
		float r, float g, float b, const char* text, int bold) {
	if (!tr || !tr->ok || !text || px <= 0) return;
	if (r != tr->curR || g != tr->curG || b != tr->curB) {
		flush_quads(tr);
		tr->curR = r; tr->curG = g; tr->curB = b;
	}
	float cx = x;
	const char* p = text;
	while (*p) {
		if (*p == '\n') { p++; continue; }
		uint32_t cp = utf8_next(&p);
		if (cp == 0) break;
		uint16_t glyph = 0;
		int font = pick_font(tr, cp, bold, &glyph);
		if (font < 0) {
			/* Missing glyph: advance by a space-ish width. */
			cx += px * 0.5f;
			continue;
		}
		CacheEntry* e = cache_glyph(tr, font, glyph, px);
		if (!e) continue;
		if (e->w > 0 && e->h > 0) {
			float x0 = cx + e->bx, y0 = y + e->by;
			float x1 = x0 + e->w, y1 = y0 + e->h;
			float u0 = (float)e->ax / ATLAS_W;
			float v0 = (float)e->ay / ATLAS_H;
			float u1 = (float)(e->ax + e->w) / ATLAS_W;
			float v1 = (float)(e->ay + e->h) / ATLAS_H;
			push_vert(tr, x0, y0, u0, v0);
			push_vert(tr, x1, y0, u1, v0);
			push_vert(tr, x1, y1, u1, v1);
			push_vert(tr, x0, y0, u0, v0);
			push_vert(tr, x1, y1, u1, v1);
			push_vert(tr, x0, y1, u0, v1);
		}
		cx += e->adv;
	}
}

void awts_text_draw(AwtsTextRenderer* tr, float x, float y, float scale,
		float r, float g, float b, const char* text) {
	int px = (int)(8.0f * scale + 0.5f);
	if (px < 4) px = 4;
	draw_run(tr, x, y, px, r, g, b, text, 0);
}

void awts_text_draw_bold(AwtsTextRenderer* tr, float x, float y, float scale,
		float r, float g, float b, const char* text) {
	int px = (int)(8.0f * scale + 0.5f);
	if (px < 4) px = 4;
	draw_run(tr, x, y, px, r, g, b, text, 1);
}

void awts_text_end(AwtsTextRenderer* tr) {
	flush_quads(tr);
	glUseProgram(0);
}

static float measure_run(AwtsTextRenderer* tr, const char* text, int px,
		int bold) {
	/* Measure without GL: needs fonts loaded. Use a lightweight path. */
	float w = 0;
	const char* p = text ? text : "";
	while (*p) {
		if (*p == '\n') { p++; continue; }
		uint32_t cp = utf8_next(&p);
		if (cp == 0) break;
		uint16_t glyph = 0;
		int font = -1;
		if (tr && tr->ok) font = pick_font(tr, cp, bold, &glyph);
		if (font < 0) { w += px * 0.5f; continue; }
		uint64_t key = cache_key(font, glyph, px);
		CacheEntry* e = cache_lookup(tr, key);
		float adv;
		if (e) {
			adv = e->adv;
		} else {
			LoadedFont* lf = &tr->fonts[font];
			int au = awts_ttf_advance(&lf->face, glyph);
			adv = au * ((float)px / (float)lf->face.unitsPerEm);
		}
		w += adv;
	}
	return w;
}

/* Width measurement uses the active renderer when available. */
float awts_text_width(const char* text, float scale) {
	int px = (int)(8.0f * scale + 0.5f);
	if (px < 4) px = 4;
	if (g_last_tr && g_last_tr->ok)
		return measure_run(g_last_tr, text, px, 0);
	size_t n = text ? strlen(text) : 0;
	return (float)n * (float)px * 0.6f;
}

float awts_text_width_bold(const char* text, float scale) {
	int px = (int)(8.0f * scale + 0.5f);
	if (px < 4) px = 4;
	if (g_last_tr && g_last_tr->ok)
		return measure_run(g_last_tr, text, px, 1);
	size_t n = text ? strlen(text) : 0;
	return (float)n * (float)px * 0.65f;
}

float awts_text_width_n(const char* text, size_t len, float scale) {
	int px = (int)(8.0f * scale + 0.5f);
	if (px < 4) px = 4;
	if (g_last_tr && g_last_tr->ok) {
		/* Copy to a temp NUL-terminated buffer for measurement. */
		char* buf = (char*)malloc(len + 1);
		if (!buf) return 0;
		memcpy(buf, text, len);
		buf[len] = 0;
		float w = measure_run(g_last_tr, buf, px, 0);
		free(buf);
		return w;
	}
	return (float)len * (float)px * 0.6f;
}

float awts_text_width_n_bold(const char* text, size_t len, float scale) {
	int px = (int)(8.0f * scale + 0.5f);
	if (px < 4) px = 4;
	if (g_last_tr && g_last_tr->ok) {
		char* buf = (char*)malloc(len + 1);
		if (!buf) return 0;
		memcpy(buf, text, len);
		buf[len] = 0;
		float w = measure_run(g_last_tr, buf, px, 1);
		free(buf);
		return w;
	}
	return (float)len * (float)px * 0.65f;
}

/* No module constructor needed; g_last_tr is set in awts_text_init. */
