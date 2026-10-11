/*
 * B"H
 *
 * Awtsmoos NativeActivity glue — clean-room C implementation compiled with
 * 100% Awtsmoos code (zero NDK). Receives ANativeActivity_onCreate from the
 * Android platform, installs lifecycle callbacks, and on window creation
 * initializes EGL + GLESv2, clears the screen, and swaps buffers.
 *
 * All EGL/GLES entry points are dynamic imports resolved by the Android
 * linker at load time (libEGL.so, libGLESv2.so).
 */

#include <android/native_activity.h>
#include <android/native_window.h>
#include <android/egl.h>
#include <android/gles.h>
#include <android/log.h>

/* EGL state, kept in globals (the portable backend supports globals). */
static EGLDisplay g_display = 0;
static EGLSurface g_surface = 0;
static EGLContext g_context = 0;

/*
 * Initialize EGL on the native window and draw one frame.
 * Returns 1 on success, 0 on failure.
 */
static int init_egl(struct ANativeWindow* window) {
    EGLDisplay dpy = eglGetDisplay(0);
    if (dpy == 0) {
        __android_log_print(6, "Awtsmoos", "eglGetDisplay failed");
        return 0;
    }
    {
        int major = 0;
        int minor = 0;
        if (eglInitialize(dpy, &major, &minor) == 0) {
            __android_log_print(6, "Awtsmoos", "eglInitialize failed");
            return 0;
        }
    }
    {
        /* Attribute list: RGBA8888, ES2 renderable, terminated by EGL_NONE. */
        int attribs[12];
        int nconfigs = 0;
        void* config = 0;
        attribs[0] = 0x3024; /* EGL_RED_SIZE */
        attribs[1] = 8;
        attribs[2] = 0x3023; /* EGL_GREEN_SIZE */
        attribs[3] = 8;
        attribs[4] = 0x3022; /* EGL_BLUE_SIZE */
        attribs[5] = 8;
        attribs[6] = 0x3021; /* EGL_ALPHA_SIZE */
        attribs[7] = 8;
        attribs[8] = 0x3040; /* EGL_RENDERABLE_TYPE */
        attribs[9] = 0x0004; /* EGL_OPENGL_ES2_BIT */
        attribs[10] = 0x3038; /* EGL_NONE */
        attribs[11] = 0x3038;
        if (eglChooseConfig(dpy, attribs, &config, 1, &nconfigs) == 0) {
            __android_log_print(6, "Awtsmoos", "eglChooseConfig failed");
            return 0;
        }
        if (nconfigs == 0) {
            __android_log_print(6, "Awtsmoos", "no EGL config");
            return 0;
        }
        g_surface = eglCreateWindowSurface(dpy, config, window, 0);
        if (g_surface == 0) {
            __android_log_print(6, "Awtsmoos", "eglCreateWindowSurface failed");
            return 0;
        }
        g_context = eglCreateContext(dpy, config, 0, 0);
        if (g_context == 0) {
            __android_log_print(6, "Awtsmoos", "eglCreateContext failed");
            return 0;
        }
        if (eglMakeCurrent(dpy, g_surface, g_surface, g_context) == 0) {
            __android_log_print(6, "Awtsmoos", "eglMakeCurrent failed");
            return 0;
        }
    }
    g_display = dpy;
    __android_log_print(4, "Awtsmoos", "EGL initialized");
    return 1;
}

/* Draw one frame: clear to Awtsmoos blue and present. */
static void draw_frame(void) {
    if (g_display == 0) return;
    glClearColor(0.2f, 0.4f, 0.9f, 1.0f);
    glClear(0x4000); /* GL_COLOR_BUFFER_BIT */
    eglSwapBuffers(g_display, g_surface);
}

/* Release EGL resources when the window goes away. */
static void term_egl(void) {
    if (g_display == 0) return;
    eglMakeCurrent(g_display, 0, 0, 0);
    if (g_surface != 0) eglDestroySurface(g_display, g_surface);
    eglTerminate(g_display);
    g_display = 0;
    g_surface = 0;
    g_context = 0;
}

/* ---- Lifecycle callbacks ---- */

static void on_start(struct ANativeActivity* activity) {
    __android_log_print(4, "Awtsmoos", "onStart");
}

static void on_resume(struct ANativeActivity* activity) {
    __android_log_print(4, "Awtsmoos", "onResume");
}

static void on_pause(struct ANativeActivity* activity) {
    __android_log_print(4, "Awtsmoos", "onPause");
}

static void on_stop(struct ANativeActivity* activity) {
    __android_log_print(4, "Awtsmoos", "onStop");
}

static void on_destroy(struct ANativeActivity* activity) {
    __android_log_print(4, "Awtsmoos", "onDestroy");
    term_egl();
}

static void on_window_created(struct ANativeActivity* activity,
                              struct ANativeWindow* window) {
    __android_log_print(4, "Awtsmoos", "onNativeWindowCreated");
    if (init_egl(window)) {
        draw_frame();
    }
}

static void on_window_destroyed(struct ANativeActivity* activity,
                                struct ANativeWindow* window) {
    __android_log_print(4, "Awtsmoos", "onNativeWindowDestroyed");
    term_egl();
}

/*
 * Platform entry point. The OS calls this once at launch; we install our
 * callback table so the platform can drive the lifecycle.
 */
void ANativeActivity_onCreate(struct ANativeActivity* activity,
                              void* savedState,
                              unsigned long savedStateSize) {
    __android_log_print(4, "Awtsmoos", "ANativeActivity_onCreate");
    activity->callbacks->onStart = on_start;
    activity->callbacks->onResume = on_resume;
    activity->callbacks->onPause = on_pause;
    activity->callbacks->onStop = on_stop;
    activity->callbacks->onDestroy = on_destroy;
    activity->callbacks->onNativeWindowCreated = on_window_created;
    activity->callbacks->onNativeWindowDestroyed = on_window_destroyed;
}
