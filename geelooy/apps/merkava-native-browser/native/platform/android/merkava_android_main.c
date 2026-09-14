/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include <android/log.h>
#include <android_native_app_glue.h>
#include <GLES3/gl3.h>

#include "merkava_android_asset.h"
#include "merkava_android_egl.h"

#define AWTS_LOG(...) __android_log_print(ANDROID_LOG_INFO, "Merkava", __VA_ARGS__)

typedef struct AwtsAndroidState {
	struct android_app* app;
	AwtsAndroidGraphics graphics;
	int ready;
} AwtsAndroidState;

/** Handles only Android window lifecycle; bytecode owns browser/application law. */
static void handle_command(struct android_app* app, int32_t command) {
	AwtsAndroidState* state = (AwtsAndroidState*)app->userData;
	if (command == APP_CMD_INIT_WINDOW && app->window) {
		state->ready = awts_android_graphics_open(app->window, &state->graphics);
		AWTS_LOG("graphics_ready=%d", state->ready);
	}
	if (command == APP_CMD_TERM_WINDOW) {
		awts_android_graphics_close(&state->graphics);
		state->ready = 0;
	}
}

/** Android NativeActivity entrypoint for the final canonical runtime host. */
void android_main(struct android_app* app) {
	app_dummy();
	AwtsAndroidState state = {0};
	state.app = app;
	state.graphics.display = EGL_NO_DISPLAY;
	state.graphics.context = EGL_NO_CONTEXT;
	state.graphics.surface = EGL_NO_SURFACE;
	app->userData = &state;
	app->onAppCmd = handle_command;
	if (!awts_android_verify_asset(app->activity->assetManager)) {
		AWTS_LOG("canonical_asset_invalid");
		return;
	}
	AWTS_LOG("canonical_asset_verified");
	while (!app->destroyRequested) {
		int events;
		struct android_poll_source* source;
		while (ALooper_pollAll(state.ready ? 0 : -1, NULL, &events, (void**)&source) >= 0) {
			if (source) source->process(app, source);
			if (app->destroyRequested) break;
		}
		if (state.ready) {
			glViewport(0, 0, ANativeWindow_getWidth(app->window), ANativeWindow_getHeight(app->window));
			glClearColor(0.02f, 0.03f, 0.05f, 1.0f);
			glClear(GL_COLOR_BUFFER_BIT);
			awts_android_graphics_present(&state.graphics);
		}
	}
	awts_android_graphics_close(&state.graphics);
}
