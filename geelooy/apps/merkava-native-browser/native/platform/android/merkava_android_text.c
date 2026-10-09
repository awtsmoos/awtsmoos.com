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

/* Length-bounded variant: never reads past end. */
static uint32_t utf8_next_n(const char** pp, const char* end) {
	const unsigned char* p = (const unsigned char*)*pp;
	if (p >= (const unsigned char*)end) return 0;
	uint32_t cp;
	if (p[0] < 0x80) { cp = p[0]; *pp += 1; }
	else if ((p[0] & 0xE0) == 0xC0 && p + 1 < (const unsigned char*)end) {
		cp = ((uint32_t)(p[0] & 0x1F) << 6) | (p[1] & 0x3F); *pp += 2;
	} else if ((p[0] & 0xF0) == 0xE0 && p + 2 < (const unsigned char*)end) {
		cp = ((uint32_t)(p[0] & 0x0F) << 12) | ((uint32_t)(p[1] & 0x3F) << 6) |
		     (p[2] & 0x3F); *pp += 3;
	} else if ((p[0] & 0xF8) == 0xF0 && p + 3 < (const unsigned char*)end) {
		cp = ((uint32_t)(p[0] & 0x07) << 18) | ((uint32_t)(p[1] & 0x3F) << 12) |
		     ((uint32_t)(p[2] & 0x3F) << 6) | (p[3] & 0x3F); *pp += 4;
	} else { cp = 0xFFFD; *pp += 1; }
	return cp;
}

static int is_hebrew(uint32_t cp) {
	return (cp >= 0x0590 && cp <= 0x05FF) || (cp >= 0xFB1D && cp <= 0xFB4F);
}

/* ------------------------------------------------------------------ */
/* Font loading (Hebrew fonts load lazily on first Hebrew codepoint)   */
/* ------------------------------------------------------------------ */

static int load_one_font(LoadedFont* lf, const char* const* paths) {
	memset(lf, 0, sizeof(*lf));
	lf->loadAttempted = 1;
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

/* Loads a lazy font slot on first use. Never retries a failed load. */
static void ensure_font(AwtsTextRenderer* tr, int slot) {
	LoadedFont* lf = &tr->fonts[slot];
	if (lf->face.ok || lf->loadAttempted) return;
	load_one_font(lf, FONT_PATHS[slot]);
}

/* ------------------------------------------------------------------ */
/* Font selection                                                     */
/* ------------------------------------------------------------------ */

static int pick_font(AwtsTextRenderer* tr, uint32_t cp, int bold,
		uint16_t* outGlyph) {
	int order[FONT_COUNT];
	int n = 0;
	if (is_hebrew(cp)) {
		/* B"H: Hebrew fonts load here on first Hebrew codepoint,
		   not at init. Latin-only pages never pay for them. */
		ensure_font(tr, FONT_HEBREW);
		ensure_font(tr, FONT_HEBREW_BOLD);
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

/* B"H: key==0 is the "unused" sentinel. px is clamped >= 4 at every entry
   point, so (font<<48)|(glyph<<16)|px can never be 0 for a real entry. */
static uint64_t cache_key(int font, uint16_t glyph, int px) {
	return ((uint64_t)(uint32_t)font << 48) |
	       ((uint64_t)glyph << 16) | (uint64_t)(uint32_t)px;
}

static void cache_reset(AwtsTextRenderer* tr) {
	memset(tr->cache, 0, sizeof(tr->cache));
	tr->shelfX = 0; tr->shelfY = 0; tr->shelfH = 0;
	/* B"H: ASCII entry pointers are stale after atlas reset (they point
	   into the cleared hash table). Metrics tables (font/glyph/adv/px)
	   survive — only the atlas UVs are invalid. */
	memset(tr->asciiEntry, 0, sizeof(tr->asciiEntry));
}

static CacheEntry* cache_lookup(AwtsTextRenderer* tr, uint64_t key) {
	size_t mask = CACHE_SLOTS - 1;
	size_t i = (size_t)(key * 11400714819323198485ull) & mask;
	for (size_t n = 0; n < CACHE_SLOTS; n++) {
		CacheEntry* e = &tr->cache[i];
		if (e->key == 0) return NULL;
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
		if (e->key == 0 || e->key == key) {
			e->key = key;
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
	e->ax = (int16_t)ax; e->ay = (int16_t)ay;
	e->w = (int16_t)w; e->h = (int16_t)h;
	e->bx = (int16_t)bx; e->by = (int16_t)by;
	e->adv = adv;
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

	/* Device fonts: Latin eagerly, Hebrew lazily (see pick_font). */
	tr->nFonts = 0;
	for (int i = 0; i < FONT_COUNT; i++) {
		if (i == FONT_HEBREW || i == FONT_HEBREW_BOLD) {
			tr->fonts[i].lazy = 1;
			continue;
		}
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

	/* B"H: 256KB scratch (was 1MB). TTF caps glyphs at 512px. */
	tr->scratch = (uint8_t*)malloc(AWTS_TEXT_SCRATCH_SIZE);
	if (!tr->scratch) { awts_text_shutdown(tr); return 0; }

	glGenBuffers(1, &tr->vbo);
	/* B"H: start at 1024 quads (96KB), grow on demand (was 768KB fixed). */
	tr->vertCap = (size_t)AWTS_TEXT_VERT_QUADS_INIT * 6 * 4;
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
	tr->vertCap = 0;
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

/* Grows the vertex buffer 2x; beyond the hard cap, flushes and continues. */
static int push_vert_grow(AwtsTextRenderer* tr) {
	size_t maxCap = (size_t)AWTS_TEXT_VERT_QUADS_MAX * 6 * 4;
	if (tr->vertCap >= maxCap) {
		flush_quads(tr); /* keep every glyph: upload and continue */
		return tr->vertCap > 0;
	}
	size_t ncap = tr->vertCap ? tr->vertCap * 2
		: (size_t)AWTS_TEXT_VERT_QUADS_INIT * 6 * 4;
	if (ncap > maxCap) ncap = maxCap;
	float* nv = (float*)realloc(tr->verts, ncap * sizeof(float));
	if (!nv) { flush_quads(tr); return tr->vertCap > 0; }
	tr->verts = nv;
	tr->vertCap = ncap;
	return 1;
}

static void push_vert(AwtsTextRenderer* tr, float x, float y, float u, float v) {
	while (tr->vertCount + 4 > tr->vertCap) {
		if (!push_vert_grow(tr)) return;
	}
	float* p = tr->verts + tr->vertCount;
	p[0] = x; p[1] = y; p[2] = u; p[3] = v;
	tr->vertCount += 4;
}

/*
 * B"H: Batched quad emission. One capacity check + one call per glyph
 * instead of six push_vert calls (six checks, six calls). The vertex
 * order matches the old six-push_vert sequence exactly.
 */
static void push_quad(AwtsTextRenderer* tr,
		float x0, float y0, float x1, float y1,
		float u0, float v0, float u1, float v1) {
	if (tr->vertCount + 24 > tr->vertCap) {
		if (!push_vert_grow(tr)) return;
		if (tr->vertCount + 24 > tr->vertCap) return;
	}
	float* p = tr->verts + tr->vertCount;
	p[0] = x0; p[1] = y0; p[2] = u0; p[3] = v0;
	p[4] = x1; p[5] = y0; p[6] = u1; p[7] = v0;
	p[8] = x1; p[9] = y1; p[10] = u1; p[11] = v1;
	p[12] = x0; p[13] = y0; p[14] = u0; p[15] = v0;
	p[16] = x1; p[17] = y1; p[18] = u1; p[19] = v1;
	p[20] = x0; p[21] = y1; p[22] = u0; p[23] = v1;
	tr->vertCount += 24;
}

/* ------------------------------------------------------------------ */
/* ASCII fast path                                                    */
/* ------------------------------------------------------------------ */

/*
 * B"H: Builds the 128-entry ASCII tables for one (bold,px) combination.
 * Each entry is resolved via pick_font so semantics match the slow path
 * exactly (including font fallback for missing glyphs). Advances are
 * precomputed so measure never touches the TTF. Cache entries are filled
 * lazily on draw (avoids rasterizing all 128 glyphs upfront).
 *
 * Cost: 128 pick_font + 128 advance calls, once per (bold,px). Pays for
 * itself after ~128 characters (saves ~50ns/char thereafter).
 */
static void ascii_ensure(AwtsTextRenderer* tr, int bold, int px) {
	int fi = bold ? 1 : 0;
	int c;
	if (tr->asciiPx[fi] == px) return;
	for (c = 0; c < 128; c++) {
		uint16_t glyph = 0;
		int font = pick_font(tr, (uint32_t)c, bold, &glyph);
		if (font < 0) {
			font = 0;
			glyph = 0;
		}
		tr->asciiFont[fi][c] = (uint8_t)font;
		tr->asciiGlyph[fi][c] = glyph;
		if (glyph) {
			LoadedFont* lf = &tr->fonts[font];
			int au = awts_ttf_advance(&lf->face, glyph);
			tr->asciiAdv[fi][c] = au *
				((float)px / (float)lf->face.unitsPerEm);
		} else {
			tr->asciiAdv[fi][c] = (float)px * 0.5f;
		}
		tr->asciiEntry[fi][c] = NULL;
	}
	tr->asciiPx[fi] = px;
}

/* Length-delimited inner draw: no NUL scan, no temp copy. */
static void draw_run_n(AwtsTextRenderer* tr, float x, float y, int px,
		float r, float g, float b,
		const char* text, size_t len, int bold) {
	if (!tr || !tr->ok || !text || px <= 0) return;
	if (r != tr->curR || g != tr->curG || b != tr->curB) {
		flush_quads(tr);
		tr->curR = r; tr->curG = g; tr->curB = b;
	}
	ascii_ensure(tr, bold, px);
	{
		int fi = bold ? 1 : 0;
		float cx = x;
		const char* p = text;
		const char* end = text + len;
		/* Hoisted: avoid per-glyph division. */
		float uScale = 1.0f / (float)ATLAS_W;
		float vScale = 1.0f / (float)ATLAS_H;
		while (p < end) {
			unsigned char c = (unsigned char)*p;
			CacheEntry* e;
			float x0, y0, x1, y1;
			if (c == '\n') { p++; continue; }
			if (c < 0x80u) {
				/*
				 * B"H: ASCII fast path. No UTF-8 decode, no
				 * pick_font (cmap binary search), no cache_key
				 * hash — just three array lookups.
				 */
				e = tr->asciiEntry[fi][c];
				if (!e) {
					e = cache_glyph(tr,
						tr->asciiFont[fi][c],
						tr->asciiGlyph[fi][c], px);
					tr->asciiEntry[fi][c] = e;
					if (!e) {
						p++;
						continue;
					}
				}
				p++;
			} else {
				/* Slow path: non-ASCII (Hebrew etc.). */
				uint32_t cp = utf8_next_n(&p, end);
				uint32_t mkey;
				size_t mi;
				int font;
				uint16_t glyph;
				if (cp == 0) break;
				/*
				 * B"H: cp memo — repeated non-ASCII chars skip
				 * pick_font entirely (direct-mapped, 64 entries).
				 */
				mkey = cp + 1;
				mi = (size_t)((cp * 2654435761u) >> 26);
				if (tr->cpMemoCp[fi][mi] == mkey) {
					if (tr->cpMemoFont[fi][mi] == 255) {
						cx += (float)px * 0.5f;
						continue;
					}
					font = tr->cpMemoFont[fi][mi];
					glyph = tr->cpMemoGlyph[fi][mi];
				} else {
					font = pick_font(tr, cp, bold, &glyph);
					tr->cpMemoCp[fi][mi] = mkey;
					if (font < 0) {
						tr->cpMemoFont[fi][mi] = 255;
						cx += (float)px * 0.5f;
						continue;
					}
					tr->cpMemoFont[fi][mi] = (uint8_t)font;
					tr->cpMemoGlyph[fi][mi] = glyph;
				}
				e = cache_glyph(tr, font, glyph, px);
				if (!e) continue;
			}
			if (e->w > 0 && e->h > 0) {
				x0 = cx + e->bx; y0 = y + e->by;
				x1 = x0 + e->w; y1 = y0 + e->h;
				push_quad(tr, x0, y0, x1, y1,
					e->ax * uScale, e->ay * vScale,
					(e->ax + e->w) * uScale,
					(e->ay + e->h) * vScale);
			}
			cx += e->adv;
		}
	}
}

static void draw_run(AwtsTextRenderer* tr, float x, float y, int px,
		float r, float g, float b, const char* text, int bold) {
	draw_run_n(tr, x, y, px, r, g, b, text, text ? strlen(text) : 0, bold);
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

void awts_text_draw_n(AwtsTextRenderer* tr, float x, float y, float scale,
		float r, float g, float b, const char* text, size_t len) {
	int px = (int)(8.0f * scale + 0.5f);
	if (px < 4) px = 4;
	draw_run_n(tr, x, y, px, r, g, b, text, len, 0);
}

void awts_text_draw_n_bold(AwtsTextRenderer* tr, float x, float y, float scale,
		float r, float g, float b, const char* text, size_t len) {
	int px = (int)(8.0f * scale + 0.5f);
	if (px < 4) px = 4;
	draw_run_n(tr, x, y, px, r, g, b, text, len, 1);
}

void awts_text_end(AwtsTextRenderer* tr) {
	flush_quads(tr);
	glUseProgram(0);
}

/* Length-delimited measure: no temp copy. */
static float measure_run_n(AwtsTextRenderer* tr, const char* text, size_t len,
		int px, int bold) {
	/* Measure without GL: needs fonts loaded. Use a lightweight path. */
	float w = 0;
	const char* p = text ? text : "";
	const char* end = p + len;
	if (!tr || !tr->ok) {
		/* No renderer: estimate without touching fonts. */
		while (p < end) {
			unsigned char c = (unsigned char)*p;
			if (c == '\n') { p++; continue; }
			if (c < 0x80u) { p++; }
			else { utf8_next_n(&p, end); }
			w += (float)px * 0.5f;
		}
		return w;
	}
	ascii_ensure(tr, bold, px);
	{
		int fi = bold ? 1 : 0;
		while (p < end) {
			unsigned char c = (unsigned char)*p;
			uint32_t cp;
			uint32_t mkey;
			size_t mi;
			int font;
			uint16_t glyph;
			uint64_t key;
			CacheEntry* e;
			float adv;
			if (c == '\n') { p++; continue; }
			if (c < 0x80u) {
				/* B"H: ASCII fast path — precomputed advance. */
				w += tr->asciiAdv[fi][c];
				p++;
				continue;
			}
			cp = utf8_next_n(&p, end);
			if (cp == 0) break;
			/* cp memo (same as draw path). */
			mkey = cp + 1;
			mi = (size_t)((cp * 2654435761u) >> 26);
			if (tr->cpMemoCp[fi][mi] == mkey) {
				if (tr->cpMemoFont[fi][mi] == 255) {
					w += (float)px * 0.5f;
					continue;
				}
				font = tr->cpMemoFont[fi][mi];
				glyph = tr->cpMemoGlyph[fi][mi];
			} else {
				font = pick_font(tr, cp, bold, &glyph);
				tr->cpMemoCp[fi][mi] = mkey;
				if (font < 0) {
					tr->cpMemoFont[fi][mi] = 255;
					w += (float)px * 0.5f;
					continue;
				}
				tr->cpMemoFont[fi][mi] = (uint8_t)font;
				tr->cpMemoGlyph[fi][mi] = glyph;
			}
			key = cache_key(font, glyph, px);
			e = cache_lookup(tr, key);
			if (e) {
				adv = e->adv;
			} else {
				LoadedFont* lf = &tr->fonts[font];
				int au = awts_ttf_advance(&lf->face, glyph);
				adv = au * ((float)px / (float)lf->face.unitsPerEm);
			}
			w += adv;
		}
	}
	return w;
}

static float measure_run(AwtsTextRenderer* tr, const char* text, int px,
		int bold) {
	return measure_run_n(tr, text, text ? strlen(text) : 0, px, bold);
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
	if (g_last_tr && g_last_tr->ok)
		return measure_run_n(g_last_tr, text, len, px, 0);
	return (float)len * (float)px * 0.6f;
}

float awts_text_width_n_bold(const char* text, size_t len, float scale) {
	int px = (int)(8.0f * scale + 0.5f);
	if (px < 4) px = 4;
	if (g_last_tr && g_last_tr->ok)
		return measure_run_n(g_last_tr, text, len, px, 1);
	return (float)len * (float)px * 0.65f;
}

/* No module constructor needed; g_last_tr is set in awts_text_init. */
