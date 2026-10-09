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
#include "merkava_android_vm.h"
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
	AwtsVm* vm;             /* Live Merkava VM: DOM + events. */
	int textReady;
	int ready;
	int paused;
	int frames;
	int vpW, vpH;
} AwtsAndroidState;

/** Android lifecycle: window, pause, resume, save state. */
static void handle_command(struct android_app* app, int32_t command) {
	AwtsAndroidState* state = (AwtsAndroidState*)app->userData;
	switch (command) {
	case APP_CMD_INIT_WINDOW:
		if (app->window) {
			state->ready = awts_android_graphics_open(app->window, &state->graphics);
			AWTS_LOG("graphics_ready=%d", state->ready);
			if (state->ready && !state->textReady) {
				state->textReady = awts_text_init(&state->text);
				AWTS_LOG("text_ready=%d", state->textReady);
				glEnable(GL_BLEND);
				glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
			}
			if (state->vm) state->vm->layoutDirty = 1;
		}
		break;
	case APP_CMD_TERM_WINDOW:
		if (state->textReady) {
			awts_text_shutdown(&state->text);
			state->textReady = 0;
		}
		awts_android_graphics_close(&state->graphics);
		state->ready = 0;
		break;
	case APP_CMD_PAUSE:
		state->paused = 1;
		AWTS_LOG("paused");
		break;
	case APP_CMD_RESUME:
		state->paused = 0;
		AWTS_LOG("resumed");
		break;
	case APP_CMD_SAVE_STATE:
		/* No mutable app state beyond the DOM; VM persists in memory. */
		AWTS_LOG("save_state: vm_nodes=%zu",
			state->vm ? state->vm->nodeCount : 0);
		break;
	case APP_CMD_GAINED_FOCUS:
		AWTS_LOG("gained_focus");
		break;
	case APP_CMD_LOST_FOCUS:
		AWTS_LOG("lost_focus");
		break;
	default:
		break;
	}
}

/** Touch input: tap -> VM hit test -> event dispatch -> re-render. */
static int32_t handle_input(struct android_app* app, AInputEvent* event) {
	AwtsAndroidState* state = (AwtsAndroidState*)app->userData;
	if (AInputEvent_getType(event) != AINPUT_EVENT_TYPE_MOTION) return 0;
	int32_t action = AMotionEvent_getAction(event) & AMOTION_EVENT_ACTION_MASK;
	if (action != AMOTION_EVENT_ACTION_UP) return 0;
	if (!state->vm || !state->ready || !state->textReady) return 0;

	float x = AMotionEvent_getX(event, 0);
	float y = AMotionEvent_getY(event, 0);
	AWTS_LOG("tap x=%.0f y=%.0f", x, y);

	if (state->vm->layoutDirty) {
		awts_vm_layout(state->vm, (float)state->vpW);
	}
	int fired = awts_vm_tap(state->vm, x, y);
	if (fired) {
		AWTS_LOG("event_fired: layout_dirty=1");
		/* Layout re-runs on next frame before render. */
	}
	return fired ? 1 : 0;
}

/**
 * Drains pending looper events. ALooper_pollAll was removed in recent NDKs;
 * ALooper_pollOnce processes one event per call, so drain in a loop.
 * When the window is ready and unpaused we wait up to ~16ms to cap at 60fps.
 */
static void drain_events(struct android_app* app, int active) {
	int events;
	struct android_poll_source* source;
	for (;;) {
		int ident = ALooper_pollOnce(active ? 16 : -1, NULL, &events,
			(void**)&source);
		if (ident < 0) break;
		if (source) source->process(app, source);
		if (app->destroyRequested) break;
		if (!active) break;
	}
}

/** Loads assets/app.merkava and executes it on the VM. */
static void boot_vm(AwtsAndroidState* state) {
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
		state->vm = awts_vm_create();
		if (state->vm) {
			int ok = awts_vm_execute(state->vm,
				bytecodeBytes, bytecodeLen, manifestBytes, manifestLen);
			AWTS_LOG("vm_boot ok=%d nodes=%zu events=%zu",
				ok,
				state->vm->nodeCount,
				state->vm->eventCount);
		}
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
	float x;        /* left x */
	float y;
	float scale;
	float r, g, b;
	float lineH;
	float maxW;
	int bold;
} WrapCtx;

static void emit_left(const char* start, size_t len, void* vctx) {
	WrapCtx* ctx = (WrapCtx*)vctx;
	char* buf = (char*)malloc(len + 1);
	if (!buf) return;
	memcpy(buf, start, len);
	buf[len] = 0;
	if (ctx->bold)
		awts_text_draw_bold(ctx->tr, ctx->x, ctx->y,
			ctx->scale, ctx->r, ctx->g, ctx->b, buf);
	else
		awts_text_draw(ctx->tr, ctx->x, ctx->y,
			ctx->scale, ctx->r, ctx->g, ctx->b, buf);
	free(buf);
	ctx->y += ctx->lineH;
}

/** Renders one live DOM node and its children. */
static float render_node(AwtsAndroidState* state, AwtsVmNode* node,
		float x, float y, float w) {
	AwtsTextRenderer* tr = &state->text;
	float scale = node->isHeading ? 3.5f : (node->isButton ? 2.75f : 2.5f);
	int bold = node->isHeading || node->isButton;
	float lineH = 8.0f * scale * 1.35f;
	float padX = 16.0f;

	/* Button background. */
	if (node->isButton) {
		/* Drawn as text with padding; background rect via clear color
		   would need a quad renderer — text affordance suffices for v1. */
	}

	float ty = y + (node->isButton ? 12.0f : 6.0f);
	if (node->text && *node->text) {
		WrapCtx wctx = { tr, x + padX, ty, scale,
			node->r, node->g, node->b, lineH, w - padX * 2.0f, bold };
		if (node->isButton) {
			/* Center button text. */
			float tw = bold ? awts_text_width_bold(node->text, scale)
			                : awts_text_width(node->text, scale);
			wctx.x = x + (w - tw) / 2.0f;
			/* Single-line buttons: no wrap. */
			if (bold)
				awts_text_draw_bold(tr, wctx.x, ty, scale,
					node->r, node->g, node->b, node->text);
			else
				awts_text_draw(tr, wctx.x, ty, scale,
					node->r, node->g, node->b, node->text);
			ty += lineH;
		} else {
			wrap_text(node->text, scale, w - padX * 2.0f, bold,
				emit_left, &wctx);
			ty = wctx.y;
		}
		ty += (node->isButton ? 12.0f : 6.0f);
	}

	/* Children stack below. */
	float childY = ty + 4.0f;
	for (size_t i = 0; i < node->childCount; i++) {
		childY = render_node(state, node->children[i], x + 8.0f, childY, w - 8.0f);
	}
	return childY > ty ? childY : ty;
}

/** Renders the live DOM: title bar + VM nodes. */
static void render_vm(AwtsAndroidState* state, int vpW, int vpH) {
	AwtsTextRenderer* tr = &state->text;
	AwtsVm* vm = state->vm;
	awts_text_begin(tr, vpW, vpH);

	float cx = vpW / 2.0f;
	float y = vpH * 0.06f;

	/* Title bar: app name from the manifest. */
	const char* title = (vm && vm->appName) ? vm->appName : "Merkava";
	float titleScale = 4.0f;
	float titleW = awts_text_width_bold(title, titleScale);
	while (titleW > vpW * 0.86f && titleScale > 2.0f) {
		titleScale -= 0.5f;
		titleW = awts_text_width_bold(title, titleScale);
	}
	awts_text_draw_bold(tr, cx - titleW / 2.0f, y, titleScale,
		AWTS_GOLD_R, AWTS_GOLD_G, AWTS_GOLD_B, title);
	y += 8.0f * titleScale + vpH * 0.03f;

	/* Live DOM nodes. */
	if (vm && vm->root) {
		if (vm->root->childCount > 0) {
			for (size_t i = 0; i < vm->root->childCount; i++) {
				y = render_node(state, vm->root->children[i], 0, y,
					(float)vpW);
				y += 4.0f;
			}
		} else if (vm->root->text) {
			y = render_node(state, vm->root, 0, y, (float)vpW);
		}
	} else {
		const char* msg = "Hello from Merkava";
		float scale = 3.0f;
		float w = awts_text_width_bold(msg, scale);
		awts_text_draw_bold(tr, cx - w / 2.0f, y, scale,
			0.96f, 0.96f, 0.98f, msg);
	}

	/* Footer: VM stats prove live execution. */
	char foot[128];
	if (vm) {
		snprintf(foot, sizeof(foot), "merkava vm: %zu nodes, %zu events",
			vm->nodeCount, vm->eventCount);
	} else {
		snprintf(foot, sizeof(foot), "merkava-native runtime");
	}
	float fscale = 1.75f;
	float fw = awts_text_width(foot, fscale);
	awts_text_draw(tr, cx - fw / 2.0f, vpH * 0.93f, fscale,
		AWTS_GOLD_R, AWTS_GOLD_G, AWTS_GOLD_B, foot);

	awts_text_end(tr);
}

/** Android NativeActivity entrypoint for the Merkava VM host. */
void android_main(struct android_app* app) {
	AwtsAndroidState state;
	memset(&state, 0, sizeof(state));
	state.app = app;
	state.graphics.display = EGL_NO_DISPLAY;
	state.graphics.context = EGL_NO_CONTEXT;
	state.graphics.surface = EGL_NO_SURFACE;
	app->userData = &state;
	app->onAppCmd = handle_command;
	app->onInputEvent = handle_input;

	/* Boot the VM before the first frame: decode + execute bytecode. */
	boot_vm(&state);
	if (!state.vm || !state.vm->ok) {
		AWTS_LOG("vm_boot_failed");
	}

	while (!app->destroyRequested) {
		int active = state.ready && !state.paused;
		drain_events(app, active);
		if (active) {
			int w = ANativeWindow_getWidth(app->window);
			int h = ANativeWindow_getHeight(app->window);
			state.vpW = w;
			state.vpH = h;

			/* Re-layout when the DOM changed (event fired). */
			if (state.vm && state.vm->layoutDirty) {
				awts_vm_layout(state.vm, (float)w);
			}

			glViewport(0, 0, w, h);
			glClearColor(AWTS_BG_R, AWTS_BG_G, AWTS_BG_B, 1.0f);
			glClear(GL_COLOR_BUFFER_BIT);
			if (state.textReady) {
				render_vm(&state, w, h);
			}
			awts_android_graphics_present(&state.graphics);
			state.frames++;
		}
	}
	if (state.textReady) awts_text_shutdown(&state.text);
	awts_android_graphics_close(&state.graphics);
	awts_vm_free(state.vm);
}
