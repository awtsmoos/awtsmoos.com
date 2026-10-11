/*
 * B"H
 *
 * Awtsmoos-owned clean-room declaration of the minimal EGL ABI needed by a
 * NativeActivity GL app.
 *
 * This header is written from scratch by Awtsmoos (Muse Spark, Meta) and is
 * NOT copied from any NDK/EGL source, header, or documentation text. Only
 * the public ABI facts (type names, function names, signatures, attribute
 * constants) are declared here, in our own wording, so Awtsmoos-compiled
 * native code can create an EGL display/context/surface on a real Android
 * device.
 *
 * Behavioral spec (emulation side):
 *   geelooy/apps/android-emulator/core/android/frameworkWebGles.js
 *   geelooy/apps/android-emulator/core/android/webglGlesCoreReplay.js
 *   geelooy/apps/android-emulator/core/android/webglPresenter.js
 * define how the EGL/GLES command stream is captured, replayed, and
 * presented while the app is being emulated.
 *
 * On-device binding: egl* resolve to the real libEGL at load time. In the
 * emulator: EGL calls are recorded into the JS replay pipeline above.
 */

#ifndef AWTSMOOS_ANDROID_EGL_H
#define AWTSMOOS_ANDROID_EGL_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* EGL scalar and handle types. */
typedef int32_t  EGLint;
typedef uint32_t EGLBoolean;
typedef void*    EGLDisplay;
typedef void*    EGLConfig;
typedef void*    EGLSurface;
typedef void*    EGLContext;
typedef void*    EGLNativeDisplayType;
typedef void*    EGLNativeWindowType;

#define AWTSMOOS_EGL_FALSE 0
#define AWTSMOOS_EGL_TRUE  1
#define EGL_FALSE AWTSMOOS_EGL_FALSE
#define EGL_TRUE  AWTSMOOS_EGL_TRUE

#define AWTSMOOS_EGL_NO_DISPLAY ((EGLDisplay)0)
#define AWTSMOOS_EGL_NO_CONTEXT ((EGLContext)0)
#define AWTSMOOS_EGL_NO_SURFACE ((EGLSurface)0)
#define AWTSMOOS_EGL_DEFAULT_DISPLAY ((EGLNativeDisplayType)0)
#define EGL_NO_DISPLAY   AWTSMOOS_EGL_NO_DISPLAY
#define EGL_NO_CONTEXT   AWTSMOOS_EGL_NO_CONTEXT
#define EGL_NO_SURFACE   AWTSMOOS_EGL_NO_SURFACE
#define EGL_DEFAULT_DISPLAY AWTSMOOS_EGL_DEFAULT_DISPLAY

/* Framebuffer-config attribute selectors for eglChooseConfig. */
#define AWTSMOOS_EGL_RED_SIZE            0x3024
#define AWTSMOOS_EGL_GREEN_SIZE          0x3023
#define AWTSMOOS_EGL_BLUE_SIZE           0x3022
#define AWTSMOOS_EGL_ALPHA_SIZE          0x3021
#define AWTSMOOS_EGL_DEPTH_SIZE          0x3025
#define AWTSMOOS_EGL_STENCIL_SIZE        0x3026
#define AWTSMOOS_EGL_SAMPLES             0x3031
#define AWTSMOOS_EGL_SAMPLE_BUFFERS      0x3032
#define AWTSMOOS_EGL_SURFACE_TYPE        0x3033
#define AWTSMOOS_EGL_RENDERABLE_TYPE     0x3040
#define AWTSMOOS_EGL_NONE                0x3038
#define EGL_RED_SIZE        AWTSMOOS_EGL_RED_SIZE
#define EGL_GREEN_SIZE      AWTSMOOS_EGL_GREEN_SIZE
#define EGL_BLUE_SIZE       AWTSMOOS_EGL_BLUE_SIZE
#define EGL_ALPHA_SIZE      AWTSMOOS_EGL_ALPHA_SIZE
#define EGL_DEPTH_SIZE      AWTSMOOS_EGL_DEPTH_SIZE
#define EGL_STENCIL_SIZE    AWTSMOOS_EGL_STENCIL_SIZE
#define EGL_SAMPLES         AWTSMOOS_EGL_SAMPLES
#define EGL_SAMPLE_BUFFERS  AWTSMOOS_EGL_SAMPLE_BUFFERS
#define EGL_SURFACE_TYPE    AWTSMOOS_EGL_SURFACE_TYPE
#define EGL_RENDERABLE_TYPE AWTSMOOS_EGL_RENDERABLE_TYPE
#define EGL_NONE            AWTSMOOS_EGL_NONE

/* Attribute values. */
#define AWTSMOOS_EGL_WINDOW_BIT              0x0004
#define AWTSMOOS_EGL_OPENGL_ES2_BIT          0x0004
#define AWTSMOOS_EGL_OPENGL_ES3_BIT          0x0040
#define AWTSMOOS_EGL_CONTEXT_CLIENT_VERSION  0x3098
#define AWTSMOOS_EGL_WIDTH                   0x3057
#define AWTSMOOS_EGL_HEIGHT                  0x3056
#define EGL_WINDOW_BIT             AWTSMOOS_EGL_WINDOW_BIT
#define EGL_OPENGL_ES2_BIT         AWTSMOOS_EGL_OPENGL_ES2_BIT
#define EGL_OPENGL_ES3_BIT         AWTSMOOS_EGL_OPENGL_ES3_BIT
#define EGL_CONTEXT_CLIENT_VERSION AWTSMOOS_EGL_CONTEXT_CLIENT_VERSION
#define EGL_WIDTH                  AWTSMOOS_EGL_WIDTH
#define EGL_HEIGHT                 AWTSMOOS_EGL_HEIGHT

/*
 * Obtain the EGL display for the given native display. On Android this is
 * eglGetDisplay(EGL_DEFAULT_DISPLAY).
 */
EGLDisplay eglGetDisplay(EGLNativeDisplayType display_id);

/*
 * Initialize the display and report its version. Returns EGL_TRUE on
 * success.
 */
EGLBoolean eglInitialize(EGLDisplay dpy, EGLint* major, EGLint* minor);

/*
 * Pick framebuffer configs matching the attribute list (terminated by
 * EGL_NONE). Returns EGL_TRUE on success.
 */
EGLBoolean eglChooseConfig(EGLDisplay dpy, const EGLint* attrib_list,
                           EGLConfig* configs, EGLint config_size,
                           EGLint* num_config);

/*
 * Create an on-screen surface bound to a native window.
 */
EGLSurface eglCreateWindowSurface(EGLDisplay dpy, EGLConfig config,
                                 EGLNativeWindowType win,
                                 const EGLint* attrib_list);

/*
 * Create a rendering context of the requested client version.
 */
EGLContext eglCreateContext(EGLDisplay dpy, EGLConfig config,
                            EGLContext share_context,
                            const EGLint* attrib_list);

/*
 * Make the given context current on the calling thread with the given
 * draw/read surfaces.
 */
EGLBoolean eglMakeCurrent(EGLDisplay dpy, EGLSurface draw, EGLSurface read,
                          EGLContext ctx);

/*
 * Post the current surface's color buffer to the native window.
 */
EGLBoolean eglSwapBuffers(EGLDisplay dpy, EGLSurface surface);

/*
 * Query the most recent error, or EGL_SUCCESS.
 */
EGLint eglGetError(void);

/*
 * Release EGL resources bound to the thread.
 */
EGLBoolean eglReleaseThread(void);

/*
 * Tear down the display.
 */
EGLBoolean eglTerminate(EGLDisplay dpy);

/*
 * Destroy a surface / context. Returns EGL_TRUE on success.
 */
EGLBoolean eglDestroySurface(EGLDisplay dpy, EGLSurface surface);
EGLBoolean eglDestroyContext(EGLDisplay dpy, EGLContext ctx);

#ifdef __cplusplus
}
#endif

#endif /* AWTSMOOS_ANDROID_EGL_H */
