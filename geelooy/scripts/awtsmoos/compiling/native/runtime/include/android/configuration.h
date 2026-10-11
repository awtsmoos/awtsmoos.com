/*
 * B"H
 *
 * Awtsmoos-owned clean-room declaration of the Android NDK configuration
 * ABI.
 *
 * This header is written from scratch by Awtsmoos (Muse Spark, Meta) and is
 * NOT copied from any NDK source, header, or documentation text. Only the
 * public ABI facts (the opaque type, getter names, signatures, enumerator
 * values) are declared here, in our own wording, so Awtsmoos-compiled native
 * code can query device configuration on a real Android device.
 *
 * Behavioral spec (emulation side):
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidViewConfigurations.js
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidViewConfigurationState.js
 * define how view/configuration values (density, orientation, screen size)
 * are reported while the app is being emulated.
 *
 * On-device binding: AConfiguration_* resolve to the real libandroid at
 * load time. In the emulator: configuration values come from the JS view-
 * configuration shims above.
 */

#ifndef AWTSMOOS_ANDROID_CONFIGURATION_H
#define AWTSMOOS_ANDROID_CONFIGURATION_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/*
 * Opaque device-configuration handle owned by the platform.
 */
typedef struct AConfiguration AConfiguration;

/* Orientation values returned by AConfiguration_getOrientation. */
typedef enum awtsmoos_android_orientation {
    AWTSMOOS_ACONFIGURATION_ORIENTATION_ANY    = 0,
    AWTSMOOS_ACONFIGURATION_ORIENTATION_PORT  = 1,
    AWTSMOOS_ACONFIGURATION_ORIENTATION_LAND  = 2,
    AWTSMOOS_ACONFIGURATION_ORIENTATION_SQUARE = 3
} awtsmoos_android_orientation;

#define ACONFIGURATION_ORIENTATION_ANY    AWTSMOOS_ACONFIGURATION_ORIENTATION_ANY
#define ACONFIGURATION_ORIENTATION_PORT   AWTSMOOS_ACONFIGURATION_ORIENTATION_PORT
#define ACONFIGURATION_ORIENTATION_LAND   AWTSMOOS_ACONFIGURATION_ORIENTATION_LAND
#define ACONFIGURATION_ORIENTATION_SQUARE AWTSMOOS_ACONFIGURATION_ORIENTATION_SQUARE

/* Keyboard types returned by AConfiguration_getKeyboard. */
typedef enum awtsmoos_android_keyboard {
    AWTSMOOS_ACONFIGURATION_KEYBOARD_ANY    = 0,
    AWTSMOOS_ACONFIGURATION_KEYBOARD_NOKEYS = 1,
    AWTSMOOS_ACONFIGURATION_KEYBOARD_QWERTY = 2,
    AWTSMOOS_ACONFIGURATION_KEYBOARD_12KEY  = 3
} awtsmoos_android_keyboard;

#define ACONFIGURATION_KEYBOARD_ANY    AWTSMOOS_ACONFIGURATION_KEYBOARD_ANY
#define ACONFIGURATION_KEYBOARD_NOKEYS AWTSMOOS_ACONFIGURATION_KEYBOARD_NOKEYS
#define ACONFIGURATION_KEYBOARD_QWERTY AWTSMOOS_ACONFIGURATION_KEYBOARD_QWERTY
#define ACONFIGURATION_KEYBOARD_12KEY  AWTSMOOS_ACONFIGURATION_KEYBOARD_12KEY

/* Touchscreen kinds returned by AConfiguration_getTouchscreen. */
typedef enum awtsmoos_android_touchscreen {
    AWTSMOOS_ACONFIGURATION_TOUCHSCREEN_ANY    = 0,
    AWTSMOOS_ACONFIGURATION_TOUCHSCREEN_NOTOUCH = 1,
    AWTSMOOS_ACONFIGURATION_TOUCHSCREEN_STYLUS = 2,
    AWTSMOOS_ACONFIGURATION_TOUCHSCREEN_FINGER = 3
} awtsmoos_android_touchscreen;

#define ACONFIGURATION_TOUCHSCREEN_ANY     AWTSMOOS_ACONFIGURATION_TOUCHSCREEN_ANY
#define ACONFIGURATION_TOUCHSCREEN_NOTOUCH AWTSMOOS_ACONFIGURATION_TOUCHSCREEN_NOTOUCH
#define ACONFIGURATION_TOUCHSCREEN_STYLUS  AWTSMOOS_ACONFIGURATION_TOUCHSCREEN_STYLUS
#define ACONFIGURATION_TOUCHSCREEN_FINGER  AWTSMOOS_ACONFIGURATION_TOUCHSCREEN_FINGER

/* Density buckets returned by AConfiguration_getDensity. */
typedef enum awtsmoos_android_density {
    AWTSMOOS_ACONFIGURATION_DENSITY_DEFAULT = 0,
    AWTSMOOS_ACONFIGURATION_DENSITY_LOW     = 120,
    AWTSMOOS_ACONFIGURATION_DENSITY_MEDIUM  = 160,
    AWTSMOOS_ACONFIGURATION_DENSITY_TV      = 213,
    AWTSMOOS_ACONFIGURATION_DENSITY_HIGH    = 240,
    AWTSMOOS_ACONFIGURATION_DENSITY_XHIGH   = 320,
    AWTSMOOS_ACONFIGURATION_DENSITY_XXHIGH  = 480,
    AWTSMOOS_ACONFIGURATION_DENSITY_XXXHIGH = 640,
    AWTSMOOS_ACONFIGURATION_DENSITY_NONE    = 65535
} awtsmoos_android_density;

#define ACONFIGURATION_DENSITY_DEFAULT AWTSMOOS_ACONFIGURATION_DENSITY_DEFAULT
#define ACONFIGURATION_DENSITY_LOW     AWTSMOOS_ACONFIGURATION_DENSITY_LOW
#define ACONFIGURATION_DENSITY_MEDIUM  AWTSMOOS_ACONFIGURATION_DENSITY_MEDIUM
#define ACONFIGURATION_DENSITY_TV      AWTSMOOS_ACONFIGURATION_DENSITY_TV
#define ACONFIGURATION_DENSITY_HIGH    AWTSMOOS_ACONFIGURATION_DENSITY_HIGH
#define ACONFIGURATION_DENSITY_XHIGH   AWTSMOOS_ACONFIGURATION_DENSITY_XHIGH
#define ACONFIGURATION_DENSITY_XXHIGH  AWTSMOOS_ACONFIGURATION_DENSITY_XXHIGH
#define ACONFIGURATION_DENSITY_XXXHIGH AWTSMOOS_ACONFIGURATION_DENSITY_XXXHIGH
#define ACONFIGURATION_DENSITY_NONE    AWTSMOOS_ACONFIGURATION_DENSITY_NONE

/*
 * Fetch the platform's current configuration into an AConfiguration handle.
 * The caller must create the handle first (e.g. with the matching new/free
 * pair); this call only fills it in.
 */
void AConfiguration_fromAssetManager(AConfiguration* out,
                                     void* assetManager);

/*
 * Current orientation of the screen.
 */
int32_t AConfiguration_getOrientation(AConfiguration* config);

/*
 * Current screen density in dpi, or one of the ACONFIGURATION_DENSITY_*
 * buckets.
 */
int32_t AConfiguration_getDensity(AConfiguration* config);

/*
 * Type of hardware keyboard present.
 */
int32_t AConfiguration_getKeyboard(AConfiguration* config);

/*
 * Type of navigation method present (0=any, 1=none, 2=dpad, 3=trackball,
 * 4=wheel).
 */
int32_t AConfiguration_getNavigation(AConfiguration* config);

/*
 * Type of touchscreen present.
 */
int32_t AConfiguration_getTouchscreen(AConfiguration* config);

/*
 * Screen-size bucket (0=any, 1=small, 2=normal, 3=large, 4=xlarge).
 */
int32_t AConfiguration_getScreenSize(AConfiguration* config);

/*
 * Current screen width in density-independent pixels.
 */
int32_t AConfiguration_getScreenWidthDp(AConfiguration* config);

/*
 * Current screen height in density-independent pixels.
 */
int32_t AConfiguration_getScreenHeightDp(AConfiguration* config);

#ifdef __cplusplus
}
#endif

#endif /* AWTSMOOS_ANDROID_CONFIGURATION_H */
