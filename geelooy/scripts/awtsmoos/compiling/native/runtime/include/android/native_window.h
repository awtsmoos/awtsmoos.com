/*
 * B"H
 *
 * Awtsmoos-owned clean-room declaration of the Android NDK native-window
 * ABI.
 *
 * This header is written from scratch by Awtsmoos (Muse Spark, Meta) and is
 * NOT copied from any NDK source, header, or documentation text. Only the
 * public ABI facts (the opaque type, function names, signatures, format
 * constants) are declared here, in our own wording, so Awtsmoos-compiled
 * native code can draw into a real Android window.
 *
 * Behavioral spec (emulation side):
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidWindowAttributes.js
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidWindowOperations.js
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidWindows.js
 *   geelooy/apps/android-emulator/core/android/surfaceHolderLifecycle.js
 * describe how windows, surfaces, geometry changes, and format requests
 * behave while the app is being emulated.
 *
 * On-device binding: ANativeWindow functions resolve to the real libandroid
 * at load time. In the emulator: window geometry and acquire/release are
 * handled by the JS window shims above.
 */

#ifndef AWTSMOOS_ANDROID_NATIVE_WINDOW_H
#define AWTSMOOS_ANDROID_NATIVE_WINDOW_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/*
 * Opaque platform window. The platform owns instances; native code obtains
 * them from ANativeActivity.window or the native-app glue, and must acquire/
 * release its references.
 */
typedef struct ANativeWindow ANativeWindow;

/* Pixel-format constants understood by ANativeWindow_setBuffersGeometry. */
typedef enum awtsmoos_android_window_format {
    AWTSMOOS_WINDOW_FORMAT_RGBA_8888 = 1,
    AWTSMOOS_WINDOW_FORMAT_RGBX_8888 = 2,
    AWTSMOOS_WINDOW_FORMAT_RGB_888   = 3,
    AWTSMOOS_WINDOW_FORMAT_RGB_565   = 4,
    AWTSMOOS_WINDOW_FORMAT_RGBA_F16  = 22
} awtsmoos_android_window_format;

/* Canonical ABI alias names for guest code ported from NDK sources. */
#define WINDOW_FORMAT_RGBA_8888 AWTSMOOS_WINDOW_FORMAT_RGBA_8888
#define WINDOW_FORMAT_RGBX_8888 AWTSMOOS_WINDOW_FORMAT_RGBX_8888
#define WINDOW_FORMAT_RGB_888   AWTSMOOS_WINDOW_FORMAT_RGB_888
#define WINDOW_FORMAT_RGB_565   AWTSMOOS_WINDOW_FORMAT_RGB_565
#define WINDOW_FORMAT_RGBA_F16  AWTSMOOS_WINDOW_FORMAT_RGBA_F16

/*
 * Take a reference on the window. Must be paired with ANativeWindow_release.
 */
void ANativeWindow_acquire(ANativeWindow* window);

/*
 * Drop a reference previously taken with ANativeWindow_acquire.
 */
void ANativeWindow_release(ANativeWindow* window);

/*
 * Current width in pixels of the window's buffers. Returns a negative
 * error code if the window is invalid.
 */
int32_t ANativeWindow_getWidth(ANativeWindow* window);

/*
 * Current height in pixels of the window's buffers.
 */
int32_t ANativeWindow_getHeight(ANativeWindow* window);

/*
 * Current pixel format of the window's buffers (one of the
 * AWTSMOOS_WINDOW_FORMAT_* values).
 */
int32_t ANativeWindow_getFormat(ANativeWindow* window);

/*
 * Request a buffer size and pixel format. Pass 0 for width/height to keep
 * the current size, and 0 for format to keep the current format. Returns 0
 * on success, negative on error.
 */
int32_t ANativeWindow_setBuffersGeometry(ANativeWindow* window,
                                         int32_t width,
                                         int32_t height,
                                         int32_t format);

/*
 * Hint to the platform about how buffers will be used (e.g. GPU sampling).
 * Returns 0 on success, negative on error.
 */
int32_t ANativeWindow_setUsage(ANativeWindow* window, uint64_t usage);

#ifdef __cplusplus
}
#endif

#endif /* AWTSMOOS_ANDROID_NATIVE_WINDOW_H */
