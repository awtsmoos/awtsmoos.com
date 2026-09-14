/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_android_egl.h"

#include <GLES3/gl3.h>

/** Opens an EGL ES3 context without placing DOM/CSS/browser rules in native C. */
int awts_android_graphics_open(ANativeWindow* window, AwtsAndroidGraphics* graphics) {
	if (!window || !graphics) {
		return 0;
	}
	EGLint config_attributes[] = {
		EGL_RENDERABLE_TYPE, EGL_OPENGL_ES3_BIT,
		EGL_SURFACE_TYPE, EGL_WINDOW_BIT,
		EGL_RED_SIZE, 8, EGL_GREEN_SIZE, 8,
		EGL_BLUE_SIZE, 8, EGL_DEPTH_SIZE, 24,
		EGL_NONE
	};
	EGLint context_attributes[] = {EGL_CONTEXT_CLIENT_VERSION, 3, EGL_NONE};
	graphics->display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
	if (graphics->display == EGL_NO_DISPLAY || !eglInitialize(graphics->display, NULL, NULL)) {
		return 0;
	}
	EGLConfig config;
	EGLint count = 0;
	if (!eglChooseConfig(graphics->display, config_attributes, &config, 1, &count) || count < 1) {
		return 0;
	}
	graphics->surface = eglCreateWindowSurface(graphics->display, config, window, NULL);
	graphics->context = eglCreateContext(graphics->display, config, EGL_NO_CONTEXT, context_attributes);
	if (graphics->surface == EGL_NO_SURFACE || graphics->context == EGL_NO_CONTEXT) {
		return 0;
	}
	return eglMakeCurrent(graphics->display, graphics->surface, graphics->surface, graphics->context);
}

void awts_android_graphics_present(AwtsAndroidGraphics* graphics) {
	if (graphics && graphics->display != EGL_NO_DISPLAY && graphics->surface != EGL_NO_SURFACE) {
		eglSwapBuffers(graphics->display, graphics->surface);
	}
}

void awts_android_graphics_close(AwtsAndroidGraphics* graphics) {
	if (!graphics || graphics->display == EGL_NO_DISPLAY) {
		return;
	}
	eglMakeCurrent(graphics->display, EGL_NO_SURFACE, EGL_NO_SURFACE, EGL_NO_CONTEXT);
	if (graphics->context != EGL_NO_CONTEXT) eglDestroyContext(graphics->display, graphics->context);
	if (graphics->surface != EGL_NO_SURFACE) eglDestroySurface(graphics->display, graphics->surface);
	eglTerminate(graphics->display);
	graphics->display = EGL_NO_DISPLAY;
	graphics->context = EGL_NO_CONTEXT;
	graphics->surface = EGL_NO_SURFACE;
}
