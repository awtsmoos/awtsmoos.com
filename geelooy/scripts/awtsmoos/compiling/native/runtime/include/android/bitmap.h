/*
 * B"H
 *
 * Awtsmoos-owned clean-room declaration of the Android NDK bitmap (jnigraphics)
 * ABI.
 *
 * This header is written from scratch by Awtsmoos (Muse Spark, Meta) and is
 * NOT copied from any NDK source, header, or documentation text. Only the
 * public ABI facts (struct field order, function names, signatures, format
 * constants, return codes) are declared here, in our own wording, so
 * Awtsmoos-compiled native code can lock and inspect real Android Bitmaps.
 *
 * Behavioral spec (emulation side):
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidBitmaps.js
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidBitmapQueries.js
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidBitmapBuffers.js
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidBitmapConfigs.js
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidBitmapAllocation.js
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidBitmapPixels.js
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidBitmapMutations.js
 * define how bitmap allocation, info queries, pixel buffers, and mutations
 * behave while the app is being emulated.
 *
 * On-device binding: AndroidBitmap_* resolve to the real libjnigraphics at
 * load time. In the emulator: bitmap handles are backed by the JS bitmap
 * shims above.
 */

#ifndef AWTSMOOS_ANDROID_BITMAP_H
#define AWTSMOOS_ANDROID_BITMAP_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Bitmap pixel formats. Stable across all Android releases. */
typedef enum awtsmoos_android_bitmap_format {
    AWTSMOOS_ANDROID_BITMAP_FORMAT_NONE      = 0,
    AWTSMOOS_ANDROID_BITMAP_FORMAT_RGBA_8888 = 1,
    AWTSMOOS_ANDROID_BITMAP_FORMAT_RGB_565   = 2,
    AWTSMOOS_ANDROID_BITMAP_FORMAT_RGBA_4444 = 3,
    AWTSMOOS_ANDROID_BITMAP_FORMAT_A_8       = 4,
    AWTSMOOS_ANDROID_BITMAP_FORMAT_RGBA_F16  = 9
} awtsmoos_android_bitmap_format;

/* Canonical ABI alias names for guest code ported from NDK sources. */
#define ANDROID_BITMAP_FORMAT_NONE      AWTSMOOS_ANDROID_BITMAP_FORMAT_NONE
#define ANDROID_BITMAP_FORMAT_RGBA_8888 AWTSMOOS_ANDROID_BITMAP_FORMAT_RGBA_8888
#define ANDROID_BITMAP_FORMAT_RGB_565   AWTSMOOS_ANDROID_BITMAP_FORMAT_RGB_565
#define ANDROID_BITMAP_FORMAT_RGBA_4444 AWTSMOOS_ANDROID_BITMAP_FORMAT_RGBA_4444
#define ANDROID_BITMAP_FORMAT_A_8       AWTSMOOS_ANDROID_BITMAP_FORMAT_A_8
#define ANDROID_BITMAP_FORMAT_RGBA_F16  AWTSMOOS_ANDROID_BITMAP_FORMAT_RGBA_F16

/*
 * Describes a bitmap's layout. The info struct is filled by
 * AndroidBitmap_getInfo; native code must not fabricate one by hand.
 */
typedef struct {
    uint32_t width;   /* bitmap width in pixels */
    uint32_t height;  /* bitmap height in pixels */
    uint32_t stride;  /* bytes per row (may exceed width * bytesPerPixel) */
    int32_t  format;  /* one of the AWTSMOOS_ANDROID_BITMAP_FORMAT_* values */
    uint32_t flags;   /* bit 0 set = alpha channel is opaque */
} AndroidBitmapInfo;

#define AWTSMOOS_ANDROID_BITMAP_FLAGS_ALPHA_OPAQUE (1u << 0)
#define ANDROID_BITMAP_FLAGS_ALPHA_OPAQUE \
    AWTSMOOS_ANDROID_BITMAP_FLAGS_ALPHA_OPAQUE

/* Return codes. Zero means success. */
typedef enum awtsmoos_android_bitmap_result {
    AWTSMOOS_ANDROID_BITMAP_RESULT_SUCCESS            = 0,
    AWTSMOOS_ANDROID_BITMAP_RESULT_BAD_PARAMETER      = -1,
    AWTSMOOS_ANDROID_BITMAP_RESULT_JNI_EXCEPTION      = -2,
    AWTSMOOS_ANDROID_BITMAP_RESULT_ALLOCATION_FAILED  = -3
} awtsmoos_android_bitmap_result;

#define ANDROID_BITMAP_RESULT_SUCCESS           \
    AWTSMOOS_ANDROID_BITMAP_RESULT_SUCCESS
#define ANDROID_BITMAP_RESULT_BAD_PARAMETER     \
    AWTSMOOS_ANDROID_BITMAP_RESULT_BAD_PARAMETER
#define ANDROID_BITMAP_RESULT_JNI_EXCEPTION     \
    AWTSMOOS_ANDROID_BITMAP_RESULT_JNI_EXCEPTION
#define ANDROID_BITMAP_RESULT_ALLOCATION_FAILED \
    AWTSMOOS_ANDROID_BITMAP_RESULT_ALLOCATION_FAILED

/*
 * Fill *info with the bitmap's dimensions, stride, format, and flags.
 * env is the calling thread's JNIEnv*, bitmap the Java Bitmap object.
 */
int AndroidBitmap_getInfo(void* env, void* bitmap, AndroidBitmapInfo* info);

/*
 * Lock the bitmap's pixels so native code can read/write them directly.
 * *pixels is set to the first pixel byte; the lock must be held while
 * touching the buffer and released with AndroidBitmap_unlockPixels.
 */
int AndroidBitmap_lockPixels(void* env, void* bitmap, void** pixels);

/*
 * Release a lock taken by AndroidBitmap_lockPixels. The bitmap must not be
 * touched through *pixels after this call.
 */
int AndroidBitmap_unlockPixels(void* env, void* bitmap);

#ifdef __cplusplus
}
#endif

#endif /* AWTSMOOS_ANDROID_BITMAP_H */
