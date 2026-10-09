/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_browser.h"
#include "merkava_android_net.h"
#include "../common/merkava_css.h"

#include <android/log.h>
#include <android_native_app_glue.h>

#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <math.h>

#define AWTS_BROWSER_LOG(...) \
	__android_log_print(ANDROID_LOG_INFO, "MerkavaBrowser", __VA_ARGS__)

/* Palette: dark dream theme. */
#define AWTS_C_BG_R 0.05f
#define AWTS_C_BG_G 0.07f
#define AWTS_C_BG_B 0.22f
#define AWTS_C_CHROME_R 0.03f
#define AWTS_C_CHROME_G 0.05f
#define AWTS_C_CHROME_B 0.16f
#define AWTS_C_URLBAR_R 0.09f
#define AWTS_C_URLBAR_G 0.12f
#define AWTS_C_URLBAR_B 0.32f
#define AWTS_C_TEXT_R 0.95f
#define AWTS_C_TEXT_G 0.95f
#define AWTS_C_TEXT_B 0.97f
#define AWTS_C_LINK_R 0.45f
#define AWTS_C_LINK_G 0.72f
#define AWTS_C_LINK_B 1.00f
#define AWTS_C_GOLD_R 1.00f
#define AWTS_C_GOLD_G 0.84f
#define AWTS_C_GOLD_B 0.38f
#define AWTS_C_DIM_R 0.60f
#define AWTS_C_DIM_G 0.62f
#define AWTS_C_DIM_B 0.70f

#define AWTS_BROWSER_START_URL "https://example.com/"
#define AWTS_BROWSER_PAD 28.0f

/* ------------------------------------------------------------------ */
/* Rounded-rect quad renderer.                                         */
/* ------------------------------------------------------------------ */

static const char* AWTS_QUAD_VS =
	"#version 300 es\n"
	"layout(location=0) in vec2 aPos;\n"
	"uniform vec2 uRes;\n"
	"out vec2 vPx;\n"
	"void main() {\n"
	"  vPx = aPos;\n"
	"  vec2 ndc = vec2(aPos.x / uRes.x * 2.0 - 1.0,\n"
	"                  1.0 - aPos.y / uRes.y * 2.0);\n"
	"  gl_Position = vec4(ndc, 0.0, 1.0);\n"
	"}\n";

static const char* AWTS_QUAD_FS =
	"#version 300 es\n"
	"precision mediump float;\n"
	"in vec2 vPx;\n"
	"uniform vec4 uRect;\n"   /* x, y, w, h in px */
	"uniform float uRadius;\n"
	"uniform vec4 uColor;\n"
	"out vec4 oColor;\n"
	"void main() {\n"
	"  vec2 p = vPx - uRect.xy;\n"
	"  vec2 b = uRect.zw;\n"
	"  float r = min(uRadius, min(b.x, b.y) * 0.5);\n"
	"  vec2 q = abs(p - b * 0.5) - b * 0.5 + r;\n"
	"  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\n"
	"  float a = 1.0 - smoothstep(-1.0, 1.0, d);\n"
	"  if (a <= 0.0) discard;\n"
	"  oColor = vec4(uColor.rgb, uColor.a * a);\n"
	"}\n";

static GLuint compile_shader(GLenum type, const char* src) {
	GLuint s = glCreateShader(type);
	glShaderSource(s, 1, &src, NULL);
	glCompileShader(s);
	GLint ok = 0;
	glGetShaderiv(s, GL_COMPILE_STATUS, &ok);
	if (!ok) {
		char log[512];
		glGetShaderInfoLog(s, sizeof(log), NULL, log);
		AWTS_BROWSER_LOG("quad_shader_fail: %s", log);
		glDeleteShader(s);
		return 0;
	}
	return s;
}

static int quad_init(AwtsBrowser* b) {
	GLuint vs = compile_shader(GL_VERTEX_SHADER, AWTS_QUAD_VS);
	GLuint fs = compile_shader(GL_FRAGMENT_SHADER, AWTS_QUAD_FS);
	if (!vs || !fs) return 0;
	b->quadProgram = glCreateProgram();
	glAttachShader(b->quadProgram, vs);
	glAttachShader(b->quadProgram, fs);
	glBindAttribLocation(b->quadProgram, 0, "aPos");
	glLinkProgram(b->quadProgram);
	glDeleteShader(vs);
	glDeleteShader(fs);
	GLint ok = 0;
	glGetProgramiv(b->quadProgram, GL_LINK_STATUS, &ok);
	if (!ok) return 0;
	b->quadURes = glGetUniformLocation(b->quadProgram, "uRes");
	b->quadURect = glGetUniformLocation(b->quadProgram, "uRect");
	b->quadURadius = glGetUniformLocation(b->quadProgram, "uRadius");
	b->quadUColor = glGetUniformLocation(b->quadProgram, "uColor");
	glGenBuffers(1, &b->quadVbo);
	glBindBuffer(GL_ARRAY_BUFFER, b->quadVbo);
	glBufferData(GL_ARRAY_BUFFER, sizeof(float) * 8, NULL,
		GL_DYNAMIC_DRAW);
	b->quadOk = 1;
	return 1;
}

static void quad_draw(AwtsBrowser* b, float x, float y, float w, float h,
	float radius, float r, float g, float bl, float a) {
	if (!b->quadOk || w <= 0 || h <= 0) return;
	glUseProgram(b->quadProgram);
	glUniform2f(b->quadURes, (float)b->vpW, (float)b->vpH);
	glUniform4f(b->quadURect, x, y, w, h);
	glUniform1f(b->quadURadius, radius);
	glUniform4f(b->quadUColor, r, g, bl, a);
	float verts[8] = { x, y, x + w, y, x, y + h, x + w, y + h };
	glBindBuffer(GL_ARRAY_BUFFER, b->quadVbo);
	glBufferSubData(GL_ARRAY_BUFFER, 0, sizeof(verts), verts);
	glEnableVertexAttribArray(0);
	glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 0, 0);
	glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
	glDisableVertexAttribArray(0);
	glUseProgram(0);
}

/* ------------------------------------------------------------------ */
/* Browser state.                                                      */
/* ------------------------------------------------------------------ */

int awts_browser_init(AwtsBrowser* b) {
	if (!b) return 0;
	memset(b, 0, sizeof(*b));
	if (!quad_init(b)) {
		AWTS_BROWSER_LOG("quad_init_failed");
		return 0;
	}
	b->tabCount = 1;
	b->active = 0;
	AwtsBrowserTab* t = &b->tabs[0];
	strncpy(t->url, AWTS_BROWSER_START_URL, sizeof(t->url) - 1);
	strncpy(t->finalUrl, AWTS_BROWSER_START_URL, sizeof(t->finalUrl) - 1);
	snprintf(t->status, sizeof(t->status), "Ready");
	for (int i = 0; i < AWTS_BROWSER_MAX_FETCH; i++)
		pthread_mutex_init(&b->fetch[i].mu, NULL);
	return 1;
}

void awts_browser_shutdown(AwtsBrowser* b) {
	if (!b) return;
	for (int i = 0; i < b->tabCount; i++) {
		awts_html_free(&b->tabs[i].doc);
		awts_css_free(&b->tabs[i].sheet);
	}
	for (int i = 0; i < AWTS_BROWSER_MAX_FETCH; i++) {
		pthread_mutex_lock(&b->fetch[i].mu);
		if (b->fetch[i].ready && b->fetch[i].bytes)
			free(b->fetch[i].bytes);
		b->fetch[i].bytes = NULL;
		b->fetch[i].inUse = 0;
		pthread_mutex_unlock(&b->fetch[i].mu);
		pthread_mutex_destroy(&b->fetch[i].mu);
	}
	if (b->quadVbo) glDeleteBuffers(1, &b->quadVbo);
	if (b->quadProgram) glDeleteProgram(b->quadProgram);
	memset(b, 0, sizeof(*b));
}

int awts_browser_new_tab(AwtsBrowser* b) {
	if (!b || b->tabCount >= AWTS_BROWSER_MAX_TABS) return -1;
	AwtsBrowserTab* t = &b->tabs[b->tabCount];
	memset(t, 0, sizeof(*t));
	t->fresh = 1;
	snprintf(t->status, sizeof(t->status), "New tab");
	b->active = b->tabCount;
	b->tabCount++;
	/* Open the keyboard so the user can type immediately. */
	b->keyboardOpen = 1;
	b->editBuf[0] = 0;
	b->editLen = 0;
	AWTS_BROWSER_LOG("new_tab index=%d", b->active);
	return b->active;
}

void awts_browser_close_tab(AwtsBrowser* b, int index) {
	if (!b || b->tabCount <= 1) return; /* always keep one tab */
	if (index < 0 || index >= b->tabCount) return;
	awts_html_free(&b->tabs[index].doc);
	awts_css_free(&b->tabs[index].sheet);
	for (int i = index; i + 1 < b->tabCount; i++)
		b->tabs[i] = b->tabs[i + 1];
	b->tabCount--;
	memset(&b->tabs[b->tabCount], 0, sizeof(AwtsBrowserTab));
	if (b->active >= b->tabCount) b->active = b->tabCount - 1;
	/* Fix up in-flight fetches: the closed tab's fetch is dropped,
	 * higher tab indices shift down. */
	for (int i = 0; i < AWTS_BROWSER_MAX_FETCH; i++) {
		pthread_mutex_lock(&b->fetch[i].mu);
		if (b->fetch[i].inUse) {
			if (b->fetch[i].tabIndex == index)
				b->fetch[i].tabIndex = -1; /* poll discards */
			else if (b->fetch[i].tabIndex > index)
				b->fetch[i].tabIndex--;
		}
		pthread_mutex_unlock(&b->fetch[i].mu);
	}
	AWTS_BROWSER_LOG("close_tab index=%d active=%d", index, b->active);
}

void awts_browser_switch_tab(AwtsBrowser* b, int index) {
	if (!b || index < 0 || index >= b->tabCount) return;
	b->active = index;
	b->keyboardOpen = 0;
	AWTS_BROWSER_LOG("switch_tab %d", index);
}

void awts_browser_normalize_url(const char* text, char* out, size_t cap) {
	if (!out || cap == 0) return;
	out[0] = 0;
	if (!text) return;
	while (*text == ' ' || *text == '\t') text++;
	size_t n = strlen(text);
	while (n > 0 && (text[n - 1] == ' ' || text[n - 1] == '\t')) n--;
	if (n == 0) return;
	if (n + 9 >= cap) n = cap - 10;
	char tmp[2048];
	if (n >= sizeof(tmp)) n = sizeof(tmp) - 1;
	memcpy(tmp, text, n);
	tmp[n] = 0;
	if (strstr(tmp, "://"))
		snprintf(out, cap, "%s", tmp);
	else
		snprintf(out, cap, "https://%s", tmp);
}

/* ------------------------------------------------------------------ */
/* Background fetch: worker thread per navigation, main loop applies.  */
/* ------------------------------------------------------------------ */

static void* fetch_worker(void* arg) {
	AwtsFetchSlot* s = (AwtsFetchSlot*)arg;
	uint8_t* bytes = NULL;
	size_t len = 0;
	char finalUrl[2048];
	int ok = awts_net_fetch_vm((JavaVM*)s->vm, s->url, &bytes, &len,
		finalUrl, sizeof(finalUrl));
	pthread_mutex_lock(&s->mu);
	s->ok = ok;
	s->bytes = bytes;
	s->len = len;
	strncpy(s->finalUrl, finalUrl, sizeof(s->finalUrl) - 1);
	s->finalUrl[sizeof(s->finalUrl) - 1] = 0;
	s->ready = 1;
	pthread_mutex_unlock(&s->mu);
	return NULL;
}

/* Starts a background fetch for tab tabIndex. Non-blocking. */
static void fetch_start(AwtsBrowser* b, void* vm, int tabIndex,
	unsigned seq, const char* url) {
	AwtsFetchSlot* slot = NULL;
	for (int i = 0; i < AWTS_BROWSER_MAX_FETCH; i++) {
		pthread_mutex_lock(&b->fetch[i].mu);
		int free = !b->fetch[i].inUse;
		pthread_mutex_unlock(&b->fetch[i].mu);
		if (free) { slot = &b->fetch[i]; break; }
	}
	if (!slot || !vm) {
		AWTS_BROWSER_LOG("fetch_no_slot");
		AwtsBrowserTab* t = &b->tabs[tabIndex];
		t->loading = 0;
		snprintf(t->status, sizeof(t->status),
			"Load failed — check connection");
		return;
	}
	pthread_mutex_lock(&slot->mu);
	slot->inUse = 1;
	slot->tabIndex = tabIndex;
	slot->fetchSeq = seq;
	slot->vm = vm;
	slot->ready = 0;
	slot->ok = 0;
	slot->bytes = NULL;
	slot->len = 0;
	strncpy(slot->url, url, sizeof(slot->url) - 1);
	slot->url[sizeof(slot->url) - 1] = 0;
	pthread_mutex_unlock(&slot->mu);

	pthread_t th;
	pthread_attr_t attr;
	pthread_attr_init(&attr);
	pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);
	if (pthread_create(&th, &attr, fetch_worker, slot) != 0) {
		pthread_mutex_lock(&slot->mu);
		slot->inUse = 0;
		pthread_mutex_unlock(&slot->mu);
		AwtsBrowserTab* t = &b->tabs[tabIndex];
		t->loading = 0;
		snprintf(t->status, sizeof(t->status),
			"Load failed — check connection");
	}
	pthread_attr_destroy(&attr);
	AWTS_BROWSER_LOG("fetch_start tab=%d %s", tabIndex, url);
}

/** Applies completed background fetches. Call once per frame. */
void awts_browser_poll(AwtsBrowser* b) {
	if (!b) return;
	for (int i = 0; i < AWTS_BROWSER_MAX_FETCH; i++) {
		AwtsFetchSlot* s = &b->fetch[i];
		pthread_mutex_lock(&s->mu);
		if (!s->inUse || !s->ready) {
			pthread_mutex_unlock(&s->mu);
			continue;
		}
		int ok = s->ok;
		uint8_t* bytes = s->bytes;
		size_t len = s->len;
		int tabIndex = s->tabIndex;
		unsigned seq = s->fetchSeq;
		char finalUrl[2048];
		strncpy(finalUrl, s->finalUrl, sizeof(finalUrl) - 1);
		finalUrl[sizeof(finalUrl) - 1] = 0;
		s->inUse = 0;
		s->ready = 0;
		s->bytes = NULL;
		pthread_mutex_unlock(&s->mu);

		if (tabIndex < 0 || tabIndex >= b->tabCount) {
			free(bytes);
			continue;
		}
		AwtsBrowserTab* t = &b->tabs[tabIndex];
		if (seq != t->fetchSeq) {
			/* Stale: a newer navigate superseded this one. */
			free(bytes);
			AWTS_BROWSER_LOG("fetch_stale tab=%d", tabIndex);
			continue;
		}
		if (!ok || !bytes) {
			t->loading = 0;
			snprintf(t->status, sizeof(t->status),
				"Load failed — check connection");
			AWTS_BROWSER_LOG("fetch_failed tab=%d", tabIndex);
			free(bytes);
			continue;
		}
		strncpy(t->finalUrl, finalUrl, sizeof(t->finalUrl) - 1);
		t->finalUrl[sizeof(t->finalUrl) - 1] = 0;
		awts_html_free(&t->doc);
		if (!awts_html_parse((const char*)bytes, len, &t->doc)) {
			t->loading = 0;
			snprintf(t->status, sizeof(t->status), "Parse failed");
			free(bytes);
			continue;
		}
		/* v2: parse <style> into the cascade sheet. */
		awts_css_free(&t->sheet);
		t->hasSheet = 0;
		if (t->doc.css && *t->doc.css) {
			if (awts_css_parse(t->doc.css, &t->sheet))
				t->hasSheet = 1;
		}
		t->hasPage = 1;
		t->loading = 0;
		t->scrollY = 0;
		t->linkCount = 0;
		snprintf(t->status, sizeof(t->status), "%zu blocks",
			t->doc.blockCount);
		AWTS_BROWSER_LOG("page_ok tab=%d blocks=%zu title=%s",
			tabIndex, t->doc.blockCount,
			t->doc.title ? t->doc.title : "(none)");
		free(bytes);
	}
}

void awts_browser_navigate(AwtsBrowser* b, struct android_app* app,
	const char* url) {
	if (!b || !url || !*url) return;
	AwtsBrowserTab* t = &b->tabs[b->active];
	if (!awts_url_is_http(url)) {
		snprintf(t->status, sizeof(t->status),
			"Only http/https URLs supported");
		return;
	}
	strncpy(t->url, url, sizeof(t->url) - 1);
	t->url[sizeof(t->url) - 1] = 0;
	t->loading = 1;
	t->fresh = 0;
	t->fetchSeq++;
	snprintf(t->status, sizeof(t->status), "Loading…");
	AWTS_BROWSER_LOG("navigate %s", url);

	JavaVM* vm = (app && app->activity) ? app->activity->vm : NULL;
	fetch_start(b, (void*)vm, b->active, t->fetchSeq, url);
}

/* ------------------------------------------------------------------ */
/* Layout + render.                                                    */
/* ------------------------------------------------------------------ */

typedef struct {
	AwtsBrowser* b;
	AwtsTextRenderer* tr;
	float y;          /* current pen y (content coords) */
	float w;          /* content width */
	float padX;
} AwtsRenderCtx;

static float block_scale(const AwtsHtmlBlock* blk) {
	switch (blk->kind) {
	case AWTS_HTML_HEADING:
		return blk->level <= 1 ? 4.0f : blk->level == 2 ? 3.5f
			: blk->level == 3 ? 3.0f : 2.75f;
	case AWTS_HTML_LINK:
	case AWTS_HTML_TEXT:
	case AWTS_HTML_ITEM:
	case AWTS_HTML_PRE:
	default:
		return 2.5f;
	}
}

static int block_bold(const AwtsHtmlBlock* blk) {
	return blk->kind == AWTS_HTML_HEADING;
}

static void block_color(const AwtsHtmlBlock* blk, float* r, float* g,
	float* bl) {
	if (blk->kind == AWTS_HTML_LINK) {
		*r = AWTS_C_LINK_R; *g = AWTS_C_LINK_G; *bl = AWTS_C_LINK_B;
	} else {
		*r = AWTS_C_TEXT_R; *g = AWTS_C_TEXT_G; *bl = AWTS_C_TEXT_B;
	}
}

/* Greedy wrap: emit callback per line. */
typedef void (*AwtsEmitLine)(const char* s, size_t n, void* ctx);

typedef struct {
	AwtsRenderCtx* rc;
	float x;
	float maxW;
	float scale;
	float r, g, bl;
	int bold;
	int align;      /* AWTS_CSS_ALIGN_* */
	float lineH;
} AwtsEmitCtx;

static void emit_draw(const char* s, size_t n, void* vctx) {
	AwtsEmitCtx* ctx = (AwtsEmitCtx*)vctx;
	AwtsRenderCtx* rc = ctx->rc;
	float drawY = rc->y - rc->b->tabs[rc->b->active].scrollY;
	float top = AWTS_BROWSER_CHROME_H;
	/* Cull lines outside the viewport. */
	if (drawY + ctx->lineH >= top && drawY <= (float)rc->b->vpH) {
		float lw = ctx->bold
			? awts_text_width_n_bold(s, n, ctx->scale)
			: awts_text_width_n(s, n, ctx->scale);
		float dx = ctx->x;
		if (ctx->align == AWTS_CSS_ALIGN_CENTER)
			dx += (ctx->maxW - lw) * 0.5f;
		else if (ctx->align == AWTS_CSS_ALIGN_RIGHT)
			dx += ctx->maxW - lw;
		if (ctx->bold)
			awts_text_draw_n_bold(ctx->rc->tr, dx, drawY,
				ctx->scale, ctx->r, ctx->g, ctx->bl, s, n);
		else
			awts_text_draw_n(ctx->rc->tr, dx, drawY,
				ctx->scale, ctx->r, ctx->g, ctx->bl, s, n);
	}
	rc->y += ctx->lineH;
}

/* Counting emit: measures block height without drawing. */
typedef struct { int lines; } AwtsCountCtx;
static void emit_count(const char* s, size_t n, void* vctx) {
	(void)s; (void)n;
	((AwtsCountCtx*)vctx)->lines++;
}

static void wrap_emit(AwtsTextRenderer* tr, const char* text, float scale,
	float maxW, int bold, AwtsEmitLine emit, void* ctx) {
	(void)tr;
	float spaceW = bold ? awts_text_width_bold(" ", scale)
	                    : awts_text_width(" ", scale);
	const char* p = text;
	while (*p) {
		while (*p == ' ') p++;
		if (!*p) break;
		const char* lineStart = p;
		const char* lastSpace = NULL;
		float w = 0.0f;
		while (*p && *p != '\n') {
			const char* wordEnd = p;
			while (*wordEnd && *wordEnd != ' ' && *wordEnd != '\n')
				wordEnd++;
			float wordW = bold
				? awts_text_width_n_bold(p, (size_t)(wordEnd - p),
					scale)
				: awts_text_width_n(p, (size_t)(wordEnd - p), scale);
			float add = (w > 0.0f ? spaceW : 0.0f) + wordW;
			if (w + add > maxW && w > 0.0f) break;
			if (w > 0.0f) lastSpace = p - 1;
			w += add;
			p = wordEnd;
			if (*p == ' ') p++;
		}
		size_t len;
		if (*p == '\n') {
			len = (size_t)(p - lineStart);
			p++;
		} else if (*p && lastSpace && lastSpace >= lineStart) {
			len = (size_t)(lastSpace - lineStart);
			p = lastSpace + 1;
			while (*p == ' ') p++;
		} else {
			len = (size_t)(p - lineStart);
		}
		while (len > 0 && lineStart[len - 1] == ' ') len--;
		if (len > 0) emit(lineStart, len, ctx);
	}
}

static float render_block(AwtsRenderCtx* rc, AwtsBrowserTab* tab,
	const AwtsHtmlBlock* blk) {
	/* v2: cascade. */
	AwtsCssComputed cs;
	awts_css_compute(tab->hasSheet ? &tab->sheet : NULL,
		blk->tag[0] ? blk->tag : "div",
		blk->cls, blk->id, blk->style, &cs);
	if (cs.displayNone) return 0.0f;

	float startY = rc->y;
	float indent = rc->padX + cs.margin[3] + cs.padding[3];
	float availW = rc->w - indent - rc->padX - cs.margin[1]
		- cs.padding[1];
	if (availW < 40.0f) availW = 40.0f;

	rc->y += cs.margin[0] + cs.padding[0];

	if (blk->kind == AWTS_HTML_HR) {
		float drawY = rc->y + 10.0f - tab->scrollY;
		if (drawY >= AWTS_BROWSER_CHROME_H)
			quad_draw(rc->b, indent, drawY, availW, 3.0f, 1.5f,
				AWTS_C_DIM_R, AWTS_C_DIM_G, AWTS_C_DIM_B, 0.6f);
		rc->y += 24.0f + cs.margin[2] + cs.padding[2];
		return rc->y - startY;
	}

	float scale = cs.fontPx > 0.0f ? cs.fontPx / 8.0f
		: block_scale(blk);
	int bold = cs.bold || block_bold(blk);
	float r, g, bl;
	if (cs.hasColor) {
		r = cs.color[0]; g = cs.color[1]; bl = cs.color[2];
	} else {
		block_color(blk, &r, &g, &bl);
	}
	float lineH = 8.0f * scale * 1.4f;
	const char* text = blk->text ? blk->text : "";

	/* Measure first (for background quad). */
	AwtsCountCtx cc = { 0 };
	if (blk->kind == AWTS_HTML_PRE) {
		const char* p = text;
		while (*p) {
			const char* e = p;
			while (*e && *e != '\n') e++;
			if ((size_t)(e - p) > 0) cc.lines++;
			else cc.lines++;
			p = *e ? e + 1 : e;
		}
	} else {
		AwtsEmitCtx mctx;
		memset(&mctx, 0, sizeof(mctx));
		mctx.rc = rc;
		wrap_emit(rc->tr, text, scale, availW, bold,
			emit_count, &cc);
	}
	float textH = cc.lines * lineH;
	float blockH = textH + cs.padding[0] + cs.padding[2];

	/* Background quad (content coords -> screen). */
	if (cs.hasBg) {
		float bgY = (startY + cs.margin[0]) - tab->scrollY;
		float bgX = rc->padX + cs.margin[3];
		float bgW = rc->w - rc->padX * 2 - cs.margin[1]
			- cs.margin[3];
		if (bgY + blockH >= AWTS_BROWSER_CHROME_H
			&& bgY <= (float)rc->b->vpH)
			quad_draw(rc->b, bgX, bgY, bgW, blockH, 8.0f,
				cs.bg[0], cs.bg[1], cs.bg[2], 1.0f);
	}

	/* List bullet. */
	float textX = indent;
	if (blk->kind == AWTS_HTML_ITEM) {
		const char* bullet = "• ";
		float bw = awts_text_width(bullet, scale);
		AwtsEmitCtx bctx = { rc, indent, bw, scale,
			r, g, bl, bold, AWTS_CSS_ALIGN_LEFT, lineH };
		float saveY = rc->y;
		emit_draw(bullet, strlen(bullet), &bctx);
		rc->y = saveY;
		textX = indent + bw;
		availW -= bw;
	}
	if (blk->kind == AWTS_HTML_HEADING)
		rc->y += 6.0f;

	AwtsEmitCtx ectx = { rc, textX, availW, scale, r, g, bl, bold,
		cs.align, lineH };
	if (blk->kind == AWTS_HTML_PRE) {
		const char* p = text;
		while (*p) {
			const char* e = p;
			while (*e && *e != '\n') e++;
			size_t n = (size_t)(e - p);
			if (n > 0) emit_draw(p, n, &ectx);
			else rc->y += lineH;
			p = *e ? e + 1 : e;
		}
	} else {
		wrap_emit(rc->tr, text, scale, availW, bold,
			emit_draw, &ectx);
	}

	/* Link: record hit rect + underline. */
	if (blk->kind == AWTS_HTML_LINK && blk->href
		&& tab->linkCount < AWTS_BROWSER_MAX_LINKS) {
		AwtsBrowserLink* lk = &tab->links[tab->linkCount++];
		lk->x = textX;
		lk->y = startY + cs.margin[0] + cs.padding[0];
		lk->w = availW;
		lk->h = textH;
		awts_url_resolve(tab->finalUrl[0] ? tab->finalUrl : tab->url,
			blk->href, lk->href, sizeof(lk->href));
		float uy = rc->y - 6.0f - tab->scrollY;
		if (uy >= AWTS_BROWSER_CHROME_H)
			quad_draw(rc->b, textX, uy, availW, 2.0f, 1.0f,
				r, g, bl, 0.7f);
	}

	rc->y += cs.padding[2] + cs.margin[2]
		+ (blk->kind == AWTS_HTML_HEADING ? 10.0f : 8.0f);
	return rc->y - startY;
}

static void hit_add(AwtsBrowser* b, float x, float y, float w, float h,
	int kind, int tabIndex, int keyIndex) {
	if (b->hitCount >= AWTS_BROWSER_MAX_HITS) return;
	AwtsBrowserHit* ht = &b->hits[b->hitCount++];
	ht->x = x; ht->y = y; ht->w = w; ht->h = h;
	ht->kind = kind; ht->tabIndex = tabIndex; ht->keyIndex = keyIndex;
}

/* Ellipsized text draw helper. */
static void draw_ellipsize(AwtsTextRenderer* tr, const char* text,
	float x, float y, float scale, int bold, float maxW,
	float r, float g, float bl) {
	char buf[192];
	const char* show = text;
	float w = bold ? awts_text_width_bold(text, scale)
	               : awts_text_width(text, scale);
	if (w > maxW) {
		size_t n = strlen(text);
		if (n > sizeof(buf) - 4) n = sizeof(buf) - 4;
		memcpy(buf, text, n);
		buf[n] = 0;
		while (n > 4) {
			float nw = bold ? awts_text_width_bold(buf, scale)
			                : awts_text_width(buf, scale);
			if (nw <= maxW - 30.0f) break;
			n--;
			buf[n] = 0;
		}
		strcat(buf, "…");
		show = buf;
	}
	if (bold)
		awts_text_draw_bold(tr, x, y, scale, r, g, bl, show);
	else
		awts_text_draw(tr, x, y, scale, r, g, bl, show);
}

static void render_chrome(AwtsBrowser* b, AwtsTextRenderer* tr) {
	float w = (float)b->vpW;
	b->hitCount = 0;
	/* Chrome background. */
	quad_draw(b, 0, 0, w, AWTS_BROWSER_CHROME_H, 0.0f,
		AWTS_C_CHROME_R, AWTS_C_CHROME_G, AWTS_C_CHROME_B, 1.0f);

	/* Tab strip: N tabs + "+" button. */
	float plusW = 54.0f;
	float stripW = w - 24.0f - plusW - 8.0f;
	float tabW = stripW / (b->tabCount > 0 ? b->tabCount : 1);
	if (tabW > 300.0f) tabW = 300.0f;
	for (int i = 0; i < b->tabCount; i++) {
		AwtsBrowserTab* tab = &b->tabs[i];
		float tx = 12.0f + i * tabW;
		int active = (i == b->active);
		float cr = active ? AWTS_C_URLBAR_R : AWTS_C_CHROME_R;
		float cg = active ? AWTS_C_URLBAR_G : AWTS_C_CHROME_G;
		float cb = active ? AWTS_C_URLBAR_B : AWTS_C_CHROME_B;
		quad_draw(b, tx, 8.0f, tabW - 6.0f, AWTS_BROWSER_TAB_H - 16.0f,
			14.0f, cr, cg, cb, 1.0f);
		hit_add(b, tx, 8.0f, tabW - 6.0f, AWTS_BROWSER_TAB_H - 16.0f,
			0, i, 0);
		const char* title = (tab->hasPage && tab->doc.title)
			? tab->doc.title
			: (tab->fresh ? "New tab" : "Merkava");
		draw_ellipsize(tr, title, tx + 18.0f, 8.0f + 13.0f, 2.0f, 1,
			tabW - 70.0f,
			AWTS_C_GOLD_R, AWTS_C_GOLD_G, AWTS_C_GOLD_B);
		/* Close × (only when more than one tab). */
		if (b->tabCount > 1) {
			float cx = tx + tabW - 6.0f - 34.0f;
			float cy = 8.0f + 8.0f;
			awts_text_draw(tr, cx, cy, 2.0f,
				AWTS_C_DIM_R, AWTS_C_DIM_G, AWTS_C_DIM_B,
				"×");
			hit_add(b, cx - 8.0f, cy - 8.0f, 44.0f, 44.0f,
				2, i, 0);
		}
	}
	/* "+" new-tab button. */
	float px = 12.0f + b->tabCount * tabW + 4.0f;
	quad_draw(b, px, 8.0f, plusW, AWTS_BROWSER_TAB_H - 16.0f, 14.0f,
		AWTS_C_BG_R, AWTS_C_BG_G, AWTS_C_BG_B, 1.0f);
	{
		float pw = awts_text_width_bold("+", 3.0f);
		awts_text_draw_bold(tr, px + (plusW - pw) / 2.0f, 8.0f + 8.0f,
			3.0f, AWTS_C_GOLD_R, AWTS_C_GOLD_G, AWTS_C_GOLD_B,
			"+");
	}
	hit_add(b, px, 8.0f, plusW, AWTS_BROWSER_TAB_H - 16.0f, 1, -1, 0);

	/* Address bar (tappable → keyboard). */
	AwtsBrowserTab* tab = &b->tabs[b->active];
	float urlY = AWTS_BROWSER_TAB_H + 8.0f;
	quad_draw(b, 12.0f, urlY, w - 24.0f, AWTS_BROWSER_URL_H - 16.0f,
		18.0f, AWTS_C_BG_R, AWTS_C_BG_G, AWTS_C_BG_B, 1.0f);
	hit_add(b, 12.0f, urlY, w - 24.0f, AWTS_BROWSER_URL_H - 16.0f,
		3, -1, 0);
	const char* url = tab->finalUrl[0] ? tab->finalUrl : tab->url;
	float uscale = 2.0f;
	float uy = urlY + (AWTS_BROWSER_URL_H - 16.0f) / 2.0f - 8.0f * uscale
		/ 2.0f;
	if (b->keyboardOpen) {
		/* Editable text with cursor. */
		char ebuf[AWTS_BROWSER_EDIT_CAP + 8];
		snprintf(ebuf, sizeof(ebuf), "%s▏", b->editBuf);
		draw_ellipsize(tr, ebuf, 12.0f + 20.0f, uy, uscale, 0,
			w - 80.0f, AWTS_C_TEXT_R, AWTS_C_TEXT_G,
			AWTS_C_TEXT_B);
	} else {
		char ubuf[160];
		const char* ushow = url;
		float uw = awts_text_width(url, uscale);
		if (uw > w - 80.0f) {
			size_t n = strlen(url);
			size_t start = n > 60 ? n - 60 : 0;
			snprintf(ubuf, sizeof(ubuf), "…%s", url + start);
			ushow = ubuf;
		}
		awts_text_draw(tr, 12.0f + 20.0f, uy, uscale,
			AWTS_C_TEXT_R, AWTS_C_TEXT_G, AWTS_C_TEXT_B, ushow);
	}

	/* Loading / status line under the URL bar. */
	if (tab->loading || tab->status[0]) {
		float sscale = 1.75f;
		awts_text_draw(tr, 12.0f + 20.0f,
			AWTS_BROWSER_CHROME_H - 22.0f, sscale,
			AWTS_C_DIM_R, AWTS_C_DIM_G, AWTS_C_DIM_B,
			tab->loading ? "Loading…" : tab->status);
	}
}

/* ------------------------------------------------------------------ */
/* On-screen keyboard.                                                 */
/* ------------------------------------------------------------------ */

static const char* AWTS_KB_ROWS[] = {
	"1234567890",
	"qwertyuiop",
	"asdfghjkl",
	"zxcvbnm\b",     /* \b = backspace */
	"./:-_?=&",
	NULL
};
/* Row 5: special actions. keyIndex -3=hide, -2=go. */

#define AWTS_KB_ROW_H 104.0f
#define AWTS_KB_GAP 8.0f

static void render_keyboard(AwtsBrowser* b, AwtsTextRenderer* tr) {
	float w = (float)b->vpW;
	float h = (float)b->vpH;
	b->keyHitCount = 0;
	int rows = 6;
	float kbH = rows * AWTS_KB_ROW_H + (rows + 1) * AWTS_KB_GAP;
	float kbY = h - kbH;
	b->kbY = kbY;
	/* Backdrop. */
	quad_draw(b, 0, kbY - 8.0f, w, kbH + 8.0f, 0.0f,
		AWTS_C_CHROME_R, AWTS_C_CHROME_G, AWTS_C_CHROME_B, 0.97f);

	for (int r = 0; r < 5; r++) {
		const char* row = AWTS_KB_ROWS[r];
		int n = (int)strlen(row);
		float kw = (w - 24.0f - (n - 1) * AWTS_KB_GAP) / n;
		float y = kbY + AWTS_KB_GAP + r * (AWTS_KB_ROW_H + AWTS_KB_GAP);
		for (int k = 0; k < n; k++) {
			float x = 12.0f + k * (kw + AWTS_KB_GAP);
			char ch = row[k];
			int special = (ch == '\b');
			quad_draw(b, x, y, kw, AWTS_KB_ROW_H, 16.0f,
				AWTS_C_URLBAR_R, AWTS_C_URLBAR_G,
				AWTS_C_URLBAR_B, 1.0f);
			if (special) {
				float lw = awts_text_width("⌫", 3.0f);
				awts_text_draw(tr, x + (kw - lw) / 2.0f,
					y + 30.0f, 3.0f,
					AWTS_C_GOLD_R, AWTS_C_GOLD_G,
					AWTS_C_GOLD_B, "⌫");
			} else {
				char label[2] = { ch, 0 };
				float lw = awts_text_width_bold(label, 3.0f);
				awts_text_draw_bold(tr, x + (kw - lw) / 2.0f,
					y + 30.0f, 3.0f,
					AWTS_C_TEXT_R, AWTS_C_TEXT_G,
					AWTS_C_TEXT_B, label);
			}
			if (b->keyHitCount < 64) {
				AwtsBrowserHit* kh =
					&b->keyHits[b->keyHitCount++];
				kh->x = x; kh->y = y; kh->w = kw;
				kh->h = AWTS_KB_ROW_H;
				kh->kind = 4;
				kh->keyIndex = special ? -1 : (int)ch;
			}
		}
	}
	/* Action row: [hide] [Go]. */
	{
		float y = kbY + AWTS_KB_GAP + 5 * (AWTS_KB_ROW_H + AWTS_KB_GAP);
		float bw = (w - 24.0f - AWTS_KB_GAP) / 2.0f;
		quad_draw(b, 12.0f, y, bw, AWTS_KB_ROW_H, 16.0f,
			AWTS_C_BG_R, AWTS_C_BG_G, AWTS_C_BG_B, 1.0f);
		{
			float lw = awts_text_width_bold("✕ hide", 2.5f);
			awts_text_draw_bold(tr, 12.0f + (bw - lw) / 2.0f,
				y + 34.0f, 2.5f, AWTS_C_DIM_R, AWTS_C_DIM_G,
				AWTS_C_DIM_B, "✕ hide");
		}
		quad_draw(b, 12.0f + bw + AWTS_KB_GAP, y, bw, AWTS_KB_ROW_H,
			16.0f, 0.15f, 0.45f, 0.25f, 1.0f);
		{
			float lw = awts_text_width_bold("Go ⏎", 2.5f);
			awts_text_draw_bold(tr,
				12.0f + bw + AWTS_KB_GAP + (bw - lw) / 2.0f,
				y + 34.0f, 2.5f, 0.9f, 1.0f, 0.9f, "Go ⏎");
		}
		if (b->keyHitCount + 2 <= 64) {
			AwtsBrowserHit* kh = &b->keyHits[b->keyHitCount++];
			kh->x = 12.0f; kh->y = y; kh->w = bw;
			kh->h = AWTS_KB_ROW_H; kh->kind = 4; kh->keyIndex = -3;
			kh = &b->keyHits[b->keyHitCount++];
			kh->x = 12.0f + bw + AWTS_KB_GAP; kh->y = y;
			kh->w = bw; kh->h = AWTS_KB_ROW_H; kh->kind = 4;
			kh->keyIndex = -2;
		}
	}
}

static void keyboard_tap(AwtsBrowser* b, float x, float y) {
	for (int i = 0; i < b->keyHitCount; i++) {
		AwtsBrowserHit* kh = &b->keyHits[i];
		if (x >= kh->x && x <= kh->x + kh->w
			&& y >= kh->y && y <= kh->y + kh->h) {
			int ki = kh->keyIndex;
			if (ki == -3) {
				b->keyboardOpen = 0;
			} else if (ki == -2) {
				/* Go: normalize + navigate (deferred). */
				char url[2048];
				awts_browser_normalize_url(b->editBuf, url,
					sizeof(url));
				if (url[0]) {
					AwtsBrowserTab* tab =
						&b->tabs[b->active];
					strncpy(tab->url, url,
						sizeof(tab->url) - 1);
					tab->loading = 2;
					tab->fresh = 0;
				}
				b->keyboardOpen = 0;
			} else if (ki == -1) {
				if (b->editLen > 0)
					b->editBuf[--b->editLen] = 0;
			} else if (ki > 0
				&& b->editLen + 1 < AWTS_BROWSER_EDIT_CAP) {
				b->editBuf[b->editLen++] = (char)ki;
				b->editBuf[b->editLen] = 0;
			}
			return;
		}
	}
	/* Tapped outside keys but inside keyboard area: ignore. */
}

void awts_browser_render(AwtsBrowser* b, AwtsTextRenderer* tr,
	int vpW, int vpH) {
	if (!b || !tr) return;
	b->vpW = vpW;
	b->vpH = vpH;
	AwtsBrowserTab* tab = &b->tabs[b->active];

	glClearColor(AWTS_C_BG_R, AWTS_C_BG_G, AWTS_C_BG_B, 1.0f);
	glClear(GL_COLOR_BUFFER_BIT);
	glEnable(GL_BLEND);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

	awts_text_begin(tr, vpW, vpH);

	/* Page content. */
	tab->linkCount = 0;
	float contentTop = AWTS_BROWSER_CHROME_H;
	float contentH = (float)vpH - contentTop;
	if (b->keyboardOpen && b->kbY > contentTop)
		contentH = b->kbY - contentTop - 8.0f;
	if (tab->hasPage) {
		AwtsRenderCtx rc;
		rc.b = b;
		rc.tr = tr;
		rc.y = contentTop + 24.0f;
		rc.w = (float)vpW;
		rc.padX = AWTS_BROWSER_PAD;
		for (size_t i = 0; i < tab->doc.blockCount; i++)
			render_block(&rc, tab, &tab->doc.blocks[i]);
		tab->contentH = rc.y - contentTop + 40.0f;
		/* Clamp scroll. */
		float maxScroll = tab->contentH - contentH;
		if (maxScroll < 0) maxScroll = 0;
		if (tab->scrollY > maxScroll) tab->scrollY = maxScroll;
		if (tab->scrollY < 0) tab->scrollY = 0;
	} else if (!tab->loading) {
		const char* msg = tab->fresh
			? "New tab — tap the address bar to type a URL."
			: "No page loaded";
		float s = 2.5f;
		float mw = awts_text_width(msg, s);
		awts_text_draw(tr, (vpW - mw) / 2.0f,
			contentTop + contentH / 2.0f, s,
			AWTS_C_DIM_R, AWTS_C_DIM_G, AWTS_C_DIM_B, msg);
	}

	render_chrome(b, tr);
	if (b->keyboardOpen)
		render_keyboard(b, tr);
	awts_text_end(tr);
}

/* ------------------------------------------------------------------ */
/* Touch: chrome (tabs/address bar/keyboard), drag-scroll, tap links.  */
/* ------------------------------------------------------------------ */

static int chrome_tap(AwtsBrowser* b, float x, float y) {
	/* Keyboard sits on top of everything. */
	if (b->keyboardOpen) {
		if (y >= b->kbY - 8.0f) {
			keyboard_tap(b, x, y);
			return 1;
		}
		/* Tapping the URL bar while open keeps focus. */
		for (int i = 0; i < b->hitCount; i++) {
			AwtsBrowserHit* ht = &b->hits[i];
			if (ht->kind == 3 && x >= ht->x && x <= ht->x + ht->w
				&& y >= ht->y && y <= ht->y + ht->h)
				return 1;
		}
		return 0;
	}
	for (int i = 0; i < b->hitCount; i++) {
		AwtsBrowserHit* ht = &b->hits[i];
		if (x >= ht->x && x <= ht->x + ht->w
			&& y >= ht->y && y <= ht->y + ht->h) {
			switch (ht->kind) {
			case 0: /* tab: switch */
				awts_browser_switch_tab(b, ht->tabIndex);
				return 1;
			case 1: /* +: new tab */
				awts_browser_new_tab(b);
				return 1;
			case 2: /* ×: close tab */
				awts_browser_close_tab(b, ht->tabIndex);
				return 1;
			case 3: { /* address bar: open keyboard */
				AwtsBrowserTab* tab = &b->tabs[b->active];
				const char* url = tab->finalUrl[0]
					? tab->finalUrl : tab->url;
				strncpy(b->editBuf, url,
					AWTS_BROWSER_EDIT_CAP - 1);
				b->editBuf[AWTS_BROWSER_EDIT_CAP - 1] = 0;
				b->editLen = (int)strlen(b->editBuf);
				b->keyboardOpen = 1;
				return 1;
			}
			}
		}
	}
	return 0;
}

int awts_browser_touch(AwtsBrowser* b, int action, float x, float y) {
	if (!b) return 0;
	AwtsBrowserTab* tab = &b->tabs[b->active];
	if (action == 0) { /* down */
		if (chrome_tap(b, x, y)) return 1;
		b->touching = 1;
		b->touchStartX = x;
		b->touchStartY = y;
		b->lastX = x;
		b->lastY = y;
		b->touchStartScroll = tab->scrollY;
		return 1;
	}
	if (action == 1) { /* move */
		if (!b->touching) return 0;
		tab->scrollY = b->touchStartScroll + (b->touchStartY - y);
		float maxScroll = tab->contentH - (b->vpH - AWTS_BROWSER_CHROME_H);
		if (maxScroll < 0) maxScroll = 0;
		if (tab->scrollY > maxScroll) tab->scrollY = maxScroll;
		if (tab->scrollY < 0) tab->scrollY = 0;
		b->lastX = x;
		b->lastY = y;
		return 1;
	}
	/* up */
	if (!b->touching) return 0;
	b->touching = 0;
	float dx = x - b->touchStartX;
	float dy = y - b->touchStartY;
	if (dx * dx + dy * dy > 30.0f * 30.0f) return 1; /* was a drag */
	/* Tap: hit-test links (content coords). */
	float cy = y + tab->scrollY;
	for (int i = 0; i < tab->linkCount; i++) {
		AwtsBrowserLink* lk = &tab->links[i];
		if (x >= lk->x && x <= lk->x + lk->w
			&& cy >= lk->y && cy <= lk->y + lk->h) {
			AWTS_BROWSER_LOG("tap_link %s", lk->href);
			/* Defer navigation: stash URL, main loop picks it up. */
			strncpy(b->tabs[b->active].url, lk->href,
				sizeof(b->tabs[b->active].url) - 1);
			b->tabs[b->active].loading = 2; /* pending nav */
			return 1;
		}
	}
	return 1;
}
