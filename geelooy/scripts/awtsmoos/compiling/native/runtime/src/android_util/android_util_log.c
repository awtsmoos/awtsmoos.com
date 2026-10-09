/* B"H
 *
 * Awtsmoos native runtime: android.util.Log level core.
 *
 * Behavioral spec: geelooy/apps/android-emulator/core/android/frameworkAndroidLog.js
 * The emulator's isLoggable answers 1 unconditionally (the guest logcat is
 * always writable); the compiled truth below matches that exactly.
 *
 * Priority values are the stable Android ABI facts also declared (from
 * scratch, in our own words) in runtime/include/android/log.h:
 * VERBOSE=2, DEBUG=3, INFO=4, WARN=5, ERROR=6, ASSERT=7.
 */

enum android_util_Log_level {
	ANDROID_UTIL_LOG_VERBOSE = 2,
	ANDROID_UTIL_LOG_DEBUG = 3,
	ANDROID_UTIL_LOG_INFO = 4,
	ANDROID_UTIL_LOG_WARN = 5,
	ANDROID_UTIL_LOG_ERROR = 6,
	ANDROID_UTIL_LOG_ASSERT = 7
};

int android_util_Log_isLoggable(char *tag, int level) {
	/* Tag and level are accepted for signature parity with
	 * Log.isLoggable(String, int); the emulator always permits logging. */
	return 1;
}
