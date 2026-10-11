/*
 * B"H
 *
 * Awtsmoos-owned clean-room declaration of the Android NDK native-activity
 * ABI (the android_native_app_glue / native_activity surface).
 *
 * This header is written from scratch by Awtsmoos (Muse Spark, Meta) and is
 * NOT copied from any NDK source, header, or documentation text. Only the
 * public ABI facts (struct field names/order, callback names, function
 * signatures) are declared here, in our own wording, so Awtsmoos-compiled
 * native code can receive lifecycle callbacks from a real Android device.
 *
 * Behavioral spec (emulation side):
 *   geelooy/apps/android-emulator/core/android/activityLifecycle.js
 *   geelooy/apps/android-emulator/core/android/activityLifecycleCallbacks.js
 *   geelooy/apps/android-emulator/core/android/applicationLifecycleState.js
 * define how activity lifecycle transitions (create/start/resume/pause/stop/
 * destroy, window attach/detach, focus, input) behave while the app is being
 * emulated.
 *
 * On-device binding: the OS fills in the ANativeActivity struct and invokes
 * ANativeActivity_onCreate from the app's shared library at launch. In the
 * emulator: lifecycle is driven by the JS lifecycle shims above.
 */

#ifndef AWTSMOOS_ANDROID_NATIVE_ACTIVITY_H
#define AWTSMOOS_ANDROID_NATIVE_ACTIVITY_H

#include <stddef.h>
#include <stdint.h>

/* Forward declarations for companion Awtsmoos ABI headers. */
struct ANativeWindow;
struct ANativeActivity;
struct AInputQueue;
struct AConfiguration;

#ifdef __cplusplus
extern "C" {
#endif

/*
 * Simple integer rectangle, used for content-rect notifications.
 */
struct ARect {
    int32_t left;
    int32_t top;
    int32_t right;
    int32_t bottom;
};

/*
 * Callback table installed on the activity before onCreate runs. Every
 * callback is optional; the platform checks for a null pointer before
 * invoking each one.
 */
struct ANativeActivityCallbacks {
    void (*onStart)(struct ANativeActivity* activity);
    void (*onResume)(struct ANativeActivity* activity);
    void* (*onSaveInstanceState)(struct ANativeActivity* activity,
                                 size_t* outSize);
    void (*onPause)(struct ANativeActivity* activity);
    void (*onStop)(struct ANativeActivity* activity);
    void (*onDestroy)(struct ANativeActivity* activity);
    void (*onWindowFocusChanged)(struct ANativeActivity* activity,
                                int hasFocus);
    void (*onNativeWindowCreated)(struct ANativeActivity* activity,
                                 struct ANativeWindow* window);
    void (*onNativeWindowResized)(struct ANativeActivity* activity,
                                 struct ANativeWindow* window);
    void (*onNativeWindowRedrawNeeded)(struct ANativeActivity* activity,
                                      struct ANativeWindow* window);
    void (*onNativeWindowDestroyed)(struct ANativeActivity* activity,
                                   struct ANativeWindow* window);
    void (*onInputQueueCreated)(struct ANativeActivity* activity,
                               struct AInputQueue* queue);
    void (*onInputQueueDestroyed)(struct ANativeActivity* activity,
                                 struct AInputQueue* queue);
    void (*onContentRectChanged)(struct ANativeActivity* activity,
                                const struct ARect* rect);
    void (*onConfigurationChanged)(struct ANativeActivity* activity);
    void (*onLowMemory)(struct ANativeActivity* activity);
};

/*
 * The activity object handed to native code by the platform. The OS owns this
 * memory and populates every field; native code reads fields and installs its
 * callback table, but must never free or reallocate it.
 */
struct ANativeActivity {
    struct ANativeActivityCallbacks* callbacks;

    /* Java runtime bridge provided by the platform. */
    void* vm;   /* JavaVM* */
    void* env;  /* JNIEnv* */

    /* The Java NativeActivity instance this struct mirrors. */
    void* clazz;

    /* internal use by the platform; opaque to native code */
    void* internalDataPath;
    void* externalDataPath;
    int32_t sdkVersion;
    void* instance;
    void* assetManager;

    /*
     * The currently attached native window, or NULL when no window is
     * attached (e.g. before onNativeWindowCreated / after
     * onNativeWindowDestroyed).
     */
    struct ANativeWindow* window;

    /* saved state handed back to onCreate, NULL when there is none */
    void* savedState;
    size_t savedStateSize;

    /* internal use by the platform; opaque to native code */
    void* internalSavedState;
};

/*
 * Main entry point every native-activity shared library must export.
 * The platform calls it once, on the thread the app runs on, before any
 * lifecycle callback. Native code typically installs its callbacks here.
 */
void ANativeActivity_onCreate(struct ANativeActivity* activity,
                              void* savedState,
                              size_t savedStateSize);

/*
 * Finish the activity and schedule its destruction. Equivalent to the Java
 * Activity.finish() call.
 */
void ANativeActivity_finish(struct ANativeActivity* activity);

/*
 * Change the window format (pixel format) of the activity's window.
 */
void ANativeActivity_setWindowFormat(struct ANativeActivity* activity,
                                     int32_t format);

/*
 * Change the fixed window size reported to the window manager. Pass
 * negative width/height to clear a previously set size.
 */
void ANativeActivity_setWindowFlags(struct ANativeActivity* activity,
                                    uint32_t addFlags,
                                    uint32_t removeFlags);

/*
 * Show the soft keyboard. Only meaningful while the activity is resumed.
 */
void ANativeActivity_showSoftInput(struct ANativeActivity* activity,
                                   uint32_t flags);

/*
 * Hide the soft keyboard.
 */
void ANativeActivity_hideSoftInput(struct ANativeActivity* activity,
                                   uint32_t flags);

#ifdef __cplusplus
}
#endif

#endif /* AWTSMOOS_ANDROID_NATIVE_ACTIVITY_H */
