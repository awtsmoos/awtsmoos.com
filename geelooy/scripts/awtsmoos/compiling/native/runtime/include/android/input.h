/*
 * B"H
 *
 * Awtsmoos-owned clean-room declaration of the Android NDK input-event ABI.
 *
 * This header is written from scratch by Awtsmoos (Muse Spark, Meta) and is
 * NOT copied from any NDK source, header, or documentation text. Only the
 * public ABI facts (the opaque type, accessor names, signatures, event-type
 * and keycode constants) are declared here, in our own wording, so
 * Awtsmoos-compiled native code can read key and motion events from a real
 * Android input queue.
 *
 * Behavioral spec (emulation side):
 *   geelooy/apps/android-emulator/core/android/browserInputCoordinates.js
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidInputMethods.js
 * define how input events, coordinates, and key dispatch behave while the
 * app is being emulated.
 *
 * On-device binding: the AInputEvent, AKeyEvent, and AMotionEvent accessor
 * functions resolve to the real libandroid at load time. In the emulator: input arrives through the
 * JS input shims above.
 */

#ifndef AWTSMOOS_ANDROID_INPUT_H
#define AWTSMOOS_ANDROID_INPUT_H

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/*
 * Opaque input event owned by the platform. Delivered through the input
 * queue's looper callback; native code must call AInputEvent_finishEvent
 * ... (see below) -- here: AInputEvent is consumed via the input-queue
 * functions, and event handles are only valid during the callback.
 */
typedef struct AInputEvent AInputEvent;

/*
 * Opaque input queue attached to the activity's looper.
 */
typedef struct AInputQueue AInputQueue;

/* Event kinds returned by AInputEvent_getType. */
typedef enum awtsmoos_android_input_event_type {
    AWTSMOOS_AINPUT_EVENT_TYPE_KEY    = 1,
    AWTSMOOS_AINPUT_EVENT_TYPE_MOTION = 2
} awtsmoos_android_input_event_type;

#define AINPUT_EVENT_TYPE_KEY    AWTSMOOS_AINPUT_EVENT_TYPE_KEY
#define AINPUT_EVENT_TYPE_MOTION AWTSMOOS_AINPUT_EVENT_TYPE_MOTION

/*
 * Kind of the event: AINPUT_EVENT_TYPE_KEY or AINPUT_EVENT_TYPE_MOTION.
 */
int32_t AInputEvent_getType(const AInputEvent* event);

/*
 * ID of the device that produced the event.
 */
int32_t AInputEvent_getDeviceId(const AInputEvent* event);

/*
 * Source bitmask describing the input device class (keyboard, touchscreen,
 * mouse, etc.). Values mirror the Java InputDevice source constants.
 */
int32_t AInputEvent_getSource(const AInputEvent* event);

/* Key-event actions returned by AKeyEvent_getAction. */
typedef enum awtsmoos_android_key_event_action {
    AWTSMOOS_AKEY_EVENT_ACTION_DOWN     = 0,
    AWTSMOOS_AKEY_EVENT_ACTION_UP       = 1,
    AWTSMOOS_AKEY_EVENT_ACTION_MULTIPLE = 2
} awtsmoos_android_key_event_action;

#define AKEY_EVENT_ACTION_DOWN     AWTSMOOS_AKEY_EVENT_ACTION_DOWN
#define AKEY_EVENT_ACTION_UP       AWTSMOOS_AKEY_EVENT_ACTION_UP
#define AKEY_EVENT_ACTION_MULTIPLE AWTSMOOS_AKEY_EVENT_ACTION_MULTIPLE

/* A small set of stable key codes; the full set follows the Java KeyEvent. */
typedef enum awtsmoos_android_keycode {
    AWTSMOOS_AKEYCODE_UNKNOWN       = 0,
    AWTSMOOS_AKEYCODE_HOME          = 3,
    AWTSMOOS_AKEYCODE_BACK          = 4,
    AWTSMOOS_AKEYCODE_VOLUME_UP     = 24,
    AWTSMOOS_AKEYCODE_VOLUME_DOWN   = 25,
    AWTSMOOS_AKEYCODE_POWER         = 26,
    AWTSMOOS_AKEYCODE_CAMERA        = 27,
    AWTSMOOS_AKEYCODE_MENU          = 82,
    AWTSMOOS_AKEYCODE_SEARCH        = 84,
    AWTSMOOS_AKEYCODE_MEDIA_PLAY_PAUSE = 85,
    AWTSMOOS_AKEYCODE_DPAD_CENTER   = 23,
    AWTSMOOS_AKEYCODE_DPAD_UP       = 19,
    AWTSMOOS_AKEYCODE_DPAD_DOWN     = 20,
    AWTSMOOS_AKEYCODE_DPAD_LEFT     = 21,
    AWTSMOOS_AKEYCODE_DPAD_RIGHT    = 22,
    AWTSMOOS_AKEYCODE_ENTER         = 66,
    AWTSMOOS_AKEYCODE_DEL           = 67,
    AWTSMOOS_AKEYCODE_TAB           = 61,
    AWTSMOOS_AKEYCODE_SPACE         = 62
} awtsmoos_android_keycode;

#define AKEYCODE_UNKNOWN       AWTSMOOS_AKEYCODE_UNKNOWN
#define AKEYCODE_HOME          AWTSMOOS_AKEYCODE_HOME
#define AKEYCODE_BACK          AWTSMOOS_AKEYCODE_BACK
#define AKEYCODE_VOLUME_UP     AWTSMOOS_AKEYCODE_VOLUME_UP
#define AKEYCODE_VOLUME_DOWN   AWTSMOOS_AKEYCODE_VOLUME_DOWN
#define AKEYCODE_POWER         AWTSMOOS_AKEYCODE_POWER
#define AKEYCODE_CAMERA        AWTSMOOS_AKEYCODE_CAMERA
#define AKEYCODE_MENU          AWTSMOOS_AKEYCODE_MENU
#define AKEYCODE_SEARCH        AWTSMOOS_AKEYCODE_SEARCH
#define AKEYCODE_DPAD_CENTER   AWTSMOOS_AKEYCODE_DPAD_CENTER
#define AKEYCODE_ENTER         AWTSMOOS_AKEYCODE_ENTER
#define AKEYCODE_DEL           AWTSMOOS_AKEYCODE_DEL
#define AKEYCODE_TAB           AWTSMOOS_AKEYCODE_TAB
#define AKEYCODE_SPACE         AWTSMOOS_AKEYCODE_SPACE

/*
 * Key-event accessors. Each takes the event (which must be of type
 * AINPUT_EVENT_TYPE_KEY) and returns the requested field.
 */
int32_t AKeyEvent_getAction(const AInputEvent* keyEvent);
int32_t AKeyEvent_getFlags(const AInputEvent* keyEvent);
int32_t AKeyEvent_getKeyCode(const AInputEvent* keyEvent);
int32_t AKeyEvent_getScanCode(const AInputEvent* keyEvent);
int32_t AKeyEvent_getMetaState(const AInputEvent* keyEvent);
int32_t AKeyEvent_getRepeatCount(const AInputEvent* keyEvent);
int64_t AKeyEvent_getDownTime(const AInputEvent* keyEvent);
int64_t AKeyEvent_getEventTime(const AInputEvent* keyEvent);

/* Motion-event actions returned by AMotionEvent_getAction (masked part). */
typedef enum awtsmoos_android_motion_event_action {
    AWTSMOOS_AMOTION_EVENT_ACTION_DOWN            = 0,
    AWTSMOOS_AMOTION_EVENT_ACTION_UP              = 1,
    AWTSMOOS_AMOTION_EVENT_ACTION_MOVE            = 2,
    AWTSMOOS_AMOTION_EVENT_ACTION_CANCEL          = 3,
    AWTSMOOS_AMOTION_EVENT_ACTION_OUTSIDE         = 4,
    AWTSMOOS_AMOTION_EVENT_ACTION_POINTER_DOWN    = 5,
    AWTSMOOS_AMOTION_EVENT_ACTION_POINTER_UP      = 6,
    AWTSMOOS_AMOTION_EVENT_ACTION_HOVER_MOVE      = 7,
    AWTSMOOS_AMOTION_EVENT_ACTION_SCROLL          = 8,
    AWTSMOOS_AMOTION_EVENT_ACTION_HOVER_ENTER     = 9,
    AWTSMOOS_AMOTION_EVENT_ACTION_HOVER_EXIT      = 10
} awtsmoos_android_motion_event_action;

#define AMOTION_EVENT_ACTION_DOWN         AWTSMOOS_AMOTION_EVENT_ACTION_DOWN
#define AMOTION_EVENT_ACTION_UP           AWTSMOOS_AMOTION_EVENT_ACTION_UP
#define AMOTION_EVENT_ACTION_MOVE         AWTSMOOS_AMOTION_EVENT_ACTION_MOVE
#define AMOTION_EVENT_ACTION_CANCEL       AWTSMOOS_AMOTION_EVENT_ACTION_CANCEL
#define AMOTION_EVENT_ACTION_OUTSIDE      AWTSMOOS_AMOTION_EVENT_ACTION_OUTSIDE
#define AMOTION_EVENT_ACTION_POINTER_DOWN AWTSMOOS_AMOTION_EVENT_ACTION_POINTER_DOWN
#define AMOTION_EVENT_ACTION_POINTER_UP   AWTSMOOS_AMOTION_EVENT_ACTION_POINTER_UP
#define AMOTION_EVENT_ACTION_HOVER_MOVE   AWTSMOOS_AMOTION_EVENT_ACTION_HOVER_MOVE
#define AMOTION_EVENT_ACTION_SCROLL       AWTSMOOS_AMOTION_EVENT_ACTION_SCROLL

/*
 * Raw action word as delivered by the platform. The low 8 bits hold the
 * action; the pointer index for pointer-up/down events lives in bits 8-15.
 * Use the awtsmoos helpers below (our own names) to split them.
 */
int32_t AMotionEvent_getAction(const AInputEvent* motionEvent);

/* Awtsmoos-authored helpers for splitting the raw motion action word. */
#define AWTSMOOS_AMOTION_EVENT_ACTION_MASK         0xff
#define AWTSMOOS_AMOTION_EVENT_ACTION_POINTER_INDEX_MASK 0xff00
#define AWTSMOOS_AMOTION_EVENT_ACTION_POINTER_INDEX_SHIFT 8

static inline int32_t
awtsmoos_motion_action_masked(int32_t rawAction)
{
    return rawAction & AWTSMOOS_AMOTION_EVENT_ACTION_MASK;
}

static inline int32_t
awtsmoos_motion_pointer_index(int32_t rawAction)
{
    return (rawAction & AWTSMOOS_AMOTION_EVENT_ACTION_POINTER_INDEX_MASK)
           >> AWTSMOOS_AMOTION_EVENT_ACTION_POINTER_INDEX_SHIFT;
}

/*
 * Motion-event accessors. pointerIndex selects which touch pointer's data
 * to read; it must be below AMotionEvent_getPointerCount.
 */
int32_t AMotionEvent_getFlags(const AInputEvent* motionEvent);
int32_t AMotionEvent_getMetaState(const AInputEvent* motionEvent);
int32_t AMotionEvent_getButtonState(const AInputEvent* motionEvent);
int32_t AMotionEvent_getEdgeFlags(const AInputEvent* motionEvent);
int64_t AMotionEvent_getDownTime(const AInputEvent* motionEvent);
int64_t AMotionEvent_getEventTime(const AInputEvent* motionEvent);
float   AMotionEvent_getXOffset(const AInputEvent* motionEvent);
float   AMotionEvent_getYOffset(const AInputEvent* motionEvent);
float   AMotionEvent_getXPrecision(const AInputEvent* motionEvent);
float   AMotionEvent_getYPrecision(const AInputEvent* motionEvent);
size_t  AMotionEvent_getPointerCount(const AInputEvent* motionEvent);
int32_t AMotionEvent_getPointerId(const AInputEvent* motionEvent,
                                  size_t pointerIndex);
float   AMotionEvent_getRawX(const AInputEvent* motionEvent,
                             size_t pointerIndex);
float   AMotionEvent_getRawY(const AInputEvent* motionEvent,
                             size_t pointerIndex);
float   AMotionEvent_getX(const AInputEvent* motionEvent,
                          size_t pointerIndex);
float   AMotionEvent_getY(const AInputEvent* motionEvent,
                          size_t pointerIndex);
float   AMotionEvent_getPressure(const AInputEvent* motionEvent,
                                 size_t pointerIndex);
float   AMotionEvent_getSize(const AInputEvent* motionEvent,
                             size_t pointerIndex);
float   AMotionEvent_getTouchMajor(const AInputEvent* motionEvent,
                                   size_t pointerIndex);
float   AMotionEvent_getTouchMinor(const AInputEvent* motionEvent,
                                   size_t pointerIndex);
float   AMotionEvent_getOrientation(const AInputEvent* motionEvent,
                                    size_t pointerIndex);
size_t  AMotionEvent_getHistorySize(const AInputEvent* motionEvent);
int64_t AMotionEvent_getHistoricalEventTime(const AInputEvent* motionEvent,
                                            size_t historyIndex);
float   AMotionEvent_getHistoricalX(const AInputEvent* motionEvent,
                                    size_t pointerIndex,
                                    size_t historyIndex);
float   AMotionEvent_getHistoricalY(const AInputEvent* motionEvent,
                                    size_t pointerIndex,
                                    size_t historyIndex);

#ifdef __cplusplus
}
#endif

#endif /* AWTSMOOS_ANDROID_INPUT_H */
