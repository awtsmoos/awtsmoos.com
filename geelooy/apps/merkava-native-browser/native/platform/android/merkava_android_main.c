/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include <android/log.h>
#include <android_native_app_glue.h>
#include <GLES3/gl3.h>

#include <stdlib.h>
#include <string.h>
#include <stdio.h>

#include "merkava_android_asset.h"
#include "merkava_android_egl.h"
#include "merkava_android_mwb4.h"
#include "merkava_android_text.h"
#include "../../canonical/merkava_container.h"

#define AWTS_LOG(...) __android_log_print(ANDROID_LOG_INFO, "Merkava", __VA_ARGS__)

/* Merkava brand palette. */
#define AWTS_BG_R 0.06f
#define AWTS_BG_G 0.09f
#define AWTS_BG_B 0.28f
#define AWTS_GOLD_R 1.0f
#define AWTS_GOLD_G 0.84f
#define AWTS_GOLD_B 0.38f

typedef struct AwtsAndroidState {
	struct android_app* app;
	AwtsAndroidGraphics graphics;
	AwtsTextRenderer text;
	AwtsMwb4Doc doc;        /* Decoded bytecode document. */
	int docReady;
	int textReady;
	int ready;
	int frames;
} AwtsAndroidState;

/** Handles only Android window lifecycle; bytecode owns browser/application law. */
static void handle_command(struct android_app* app, int32_t command) {
	AwtsAndroidState* state = (AwtsAndroidState*)app->userData;
	if (command == APP_CMD_INIT_WINDOW && app->window) {
		state->ready = awts_android_graphics_open(app->window, &state->graphics);
		AWTS_LOG("graphics_ready=%d", state->ready);
		if (state->ready && !state->textReady) {
			state->textReady = awts_text_init(&state->text);
			AWTS_LOG("text_ready=%d", state->textReady);
			glEnable(GL_BLEND);
			glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
		}
	}
	if (command == APP_CMD_TERM_WINDOW) {
		if (state->textReady) {
			awts_text_shutdown(&state->text);
			state->textReady = 0;
		}
		awts_android_graphics_close(&state->graphics);
		state->ready = 0;
	}
}

/**
 * Drains pending looper events. ALooper_pollAll was removed in recent NDKs;
 * ALooper_pollOnce processes one event per call, so drain in a loop.
 * When the window is ready we wait up to ~16ms per drain to cap at ~60fps.
 */
static void drain_events(struct android_app* app, int ready) {
	int events;
	struct android_poll_source* source;
	for (;;) {
		int ident = ALooper_pollOnce(ready ? 16 : -1, NULL, &events, (void**)&source);
		if (ident < 0) break;
		if (source) source->process(app, source);
		if (app->destroyRequested) break;
		/* When not ready, block on the first event only per frame. */
		if (!ready) break;
	}
}

/** Loads assets/app.merkava and decodes the MWB4 document once at startup. */
static void load_document(AwtsAndroidState* state) {
	uint8_t* bytes = NULL;
	size_t len = awts_android_read_asset(
		state->app->activity->assetManager, &bytes);
	if (!len || !bytes) {
		AWTS_LOG("asset_read_failed");
		return;
	}
	AwtsMerkavaContainer container;
	if (!awts_mkv_open(bytes, len, &container)) {
		AWTS_LOG("container_open_failed");
		free(bytes);
		return;
	}
	AwtsMerkavaSection manifestSec, bytecodeSec;
	const uint8_t* manifestBytes = NULL;
	size_t manifestLen = 0;
	const uint8_t* bytecodeBytes = NULL;
	size_t bytecodeLen = 0;
	if (awts_mkv_find_section(&container, AWTS_MKV_SECTION_MANIFEST, &manifestSec)) {
		manifestBytes = awts_mkv_section_bytes(&container, &manifestSec);
		manifestLen = manifestSec.length;
	}
	if (awts_mkv_find_section(&container, AWTS_MKV_SECTION_BYTECODE, &bytecodeSec)) {
		bytecodeBytes = awts_mkv_section_bytes(&container, &bytecodeSec);
		bytecodeLen = bytecodeSec.length;
	}
	if (bytecodeBytes && bytecodeLen) {
		state->docReady = awts_mwb4_decode(
			bytecodeBytes, bytecodeLen, manifestBytes, manifestLen, &state->doc);
		AWTS_LOG("doc_ready=%d texts=%zu nodes=%zu styles=%zu",
			state->docReady, state->doc.textCount,
			state->doc.nodeCount, state->doc.styleCount);
	} else {
		AWTS_LOG("bytecode_section_missing");
	}
	free(bytes);
}

/** Greedy word wrap: calls emit(start,len) for each wrapped line. */
typedef void (*AwtsLineEmit)(const char* start, size_t len, void* ctx);

static void wrap_text(const char* text, float scale, float maxW, int bold,
		AwtsLineEmit emit, void* ctx) {
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
			while (*wordEnd && *wordEnd != ' ' && *wordEnd != '\n') wordEnd++;
			float wordW = bold
				? awts_text_width_n_bold(p, (size_t)(wordEnd - p), scale)
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

typedef struct WrapCtx {
	AwtsTextRenderer* tr;
	float cx;       /* center x */
	float y;
	float scale;
	float r, g, b;
	float lineH;
	float maxW;
	int bold;
} WrapCtx;

static void emit_centered(const char* start, size_t len, void* vctx) {
	WrapCtx* ctx = (WrapCtx*)vctx;
	char* buf = (char*)malloc(len + 1);
	if (!buf) return;
	memcpy(buf, start, len);
	buf[len] = 0;
	float w = ctx->bold ? awts_text_width_bold(buf, ctx->scale)
	                    : awts_text_width(buf, ctx->scale);
	if (ctx->bold)
		awts_text_draw_bold(ctx->tr, ctx->cx - w / 2.0f, ctx->y,
			ctx->scale, ctx->r, ctx->g, ctx->b, buf);
	else
		awts_text_draw(ctx->tr, ctx->cx - w / 2.0f, ctx->y,
			ctx->scale, ctx->r, ctx->g, ctx->b, buf);
	free(buf);
	ctx->y += ctx->lineH;
}

/** Renders the decoded document: title, text runs, footer. */
static void render_document(AwtsAndroidState* state, int vpW, int vpH) {
	AwtsTextRenderer* tr = &state->text;
	awts_text_begin(tr, vpW, vpH);

	float cx = vpW / 2.0f;
	float y = vpH * 0.12f;
	float maxW = vpW * 0.86f;

	/* Title: app name from the manifest. */
	const char* title = (state->docReady && state->doc.appName)
		? state->doc.appName : "Merkava";
	float titleScale = 5.0f;
	float titleW = awts_text_width_bold(title, titleScale);
	while (titleW > maxW && titleScale > 2.0f) {
		titleScale -= 0.5f;
		titleW = awts_text_width_bold(title, titleScale);
	}
	awts_text_draw_bold(tr, cx - titleW / 2.0f, y, titleScale,
		AWTS_GOLD_R, AWTS_GOLD_G, AWTS_GOLD_B, title);
	y += 8.0f * titleScale + vpH * 0.04f;

	/* Subtitle: proves the native C VM decoded the bytecode. */
	char sub[128];
	if (state->docReady) {
		snprintf(sub, sizeof(sub), "native VM: %zu nodes, %zu texts",
			state->doc.nodeCount, state->doc.textCount);
	} else {
		snprintf(sub, sizeof(sub), "native VM: waiting for bytecode");
	}
	float subScale = 2.0f;
	float subW = awts_text_width(sub, subScale);
	awts_text_draw(tr, cx - subW / 2.0f, y, subScale, 0.65f, 0.72f, 0.95f, sub);
	y += 8.0f * subScale + vpH * 0.05f;

	/* Body: text runs decoded from MWB4, in document order. */
	if (state->docReady && state->doc.textCount) {
		for (size_t i = 0; i < state->doc.textCount; i++) {
			AwtsMwb4Text* t = &state->doc.texts[i];
			float scale = t->isHeading ? 3.5f : 2.5f;
			WrapCtx wctx = { tr, cx, y, scale, t->r, t->g, t->b,
				8.0f * scale * 1.35f, maxW, t->isHeading };
			wrap_text(t->text, scale, maxW, t->isHeading, emit_centered, &wctx);
			y = wctx.y + vpH * 0.015f;
			if (y > vpH * 0.88f) break;
		}
	} else {
		const char* msg = "Hello from Merkava";
		float scale = 3.0f;
		float w = awts_text_width_bold(msg, scale);
		awts_text_draw_bold(tr, cx - w / 2.0f, y, scale, 0.96f, 0.96f, 0.98f, msg);
	}

	/* Footer. */
	const char* foot = "merkava-native runtime";
	float fscale = 1.75f;
	float fw = awts_text_width(foot, fscale);
	awts_text_draw(tr, cx - fw / 2.0f, vpH * 0.93f, fscale,
		AWTS_GOLD_R, AWTS_GOLD_G, AWTS_GOLD_B, foot);

	awts_text_end(tr);
}

/** Android NativeActivity entrypoint for the final canonical runtime host. */
void android_main(struct android_app* app) {
	AwtsAndroidState state;
	memset(&state, 0, sizeof(state));
	state.app = app;
	state.graphics.display = EGL_NO_DISPLAY;
	state.graphics.context = EGL_NO_CONTEXT;
	state.graphics.surface = EGL_NO_SURFACE;
	app->userData = &state;
	app->onAppCmd = handle_command;

	load_document(&state);
	if (!state.docReady) {
		AWTS_LOG("canonical_asset_invalid_or_undecodable");
	}

	while (!app->destroyRequested) {
		drain_events(app, state.ready);
		if (state.ready) {
			int w = ANativeWindow_getWidth(app->window);
			int h = ANativeWindow_getHeight(app->window);
			glViewport(0, 0, w, h);
			glClearColor(AWTS_BG_R, AWTS_BG_G, AWTS_BG_B, 1.0f);
			glClear(GL_COLOR_BUFFER_BIT);
			if (state.textReady) {
				render_document(&state, w, h);
			}
			awts_android_graphics_present(&state.graphics);
			state.frames++;
		}
	}
	if (state.textReady) awts_text_shutdown(&state.text);
	awts_android_graphics_close(&state.graphics);
	awts_mwb4_free(&state.doc);
}
