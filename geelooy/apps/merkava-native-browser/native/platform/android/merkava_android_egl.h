/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_ANDROID_EGL_H
#define AWTS_MERKAVA_ANDROID_EGL_H

#include <android/native_window.h>
#include <EGL/egl.h>

/** Android EGL/GLES3 surface state owned strictly by the native host layer. */
typedef struct AwtsAndroidGraphics {
	EGLDisplay display;
	EGLContext context;
	EGLSurface surface;
} AwtsAndroidGraphics;

int awts_android_graphics_open(ANativeWindow* window, AwtsAndroidGraphics* graphics);
void awts_android_graphics_close(AwtsAndroidGraphics* graphics);
void awts_android_graphics_present(AwtsAndroidGraphics* graphics);

#endif
