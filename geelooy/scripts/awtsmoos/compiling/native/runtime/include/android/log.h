/*
 * B"H
 *
 * Awtsmoos-owned clean-room declaration of the Android NDK logging ABI.
 *
 * This header is written from scratch by Awtsmoos (Muse Spark, Meta) and is
 * NOT copied from any NDK source, header, or documentation text. Only the
 * public ABI facts (function names, enumerator names/values, signatures) are
 * declared here, in our own words and arrangement, so Awtsmoos-compiled native
 * code can link against liblog on a real Android device.
 *
 * Behavioral spec (emulation side): the guest log/shim in
 *   geelooy/apps/android-emulator/core/android/frameworkAndroidLog.js
 * and the bounded deterministic guest logcat in
 *   geelooy/apps/android-emulator/core/android/logcat.js
 * define how these calls behave while the app is being emulated.
 *
 * On-device binding: __android_log_* resolve to the real liblog at load time.
 * In the emulator: the same calls are routed to the JS logcat shim.
 */

#ifndef AWTSMOOS_ANDROID_LOG_H
#define AWTSMOOS_ANDROID_LOG_H

#include <stdarg.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/*
 * Log priority levels. Numerically stable across every Android release:
 * VERBOSE=2, DEBUG=3, INFO=4, WARN=5, ERROR=6, FATAL=7.
 */
typedef enum awtsmoos_android_log_priority {
    AWTSMOOS_ANDROID_LOG_UNKNOWN = 0,
    AWTSMOOS_ANDROID_LOG_DEFAULT = 1,
    AWTSMOOS_ANDROID_LOG_VERBOSE = 2,
    AWTSMOOS_ANDROID_LOG_DEBUG   = 3,
    AWTSMOOS_ANDROID_LOG_INFO    = 4,
    AWTSMOOS_ANDROID_LOG_WARN    = 5,
    AWTSMOOS_ANDROID_LOG_ERROR   = 6,
    AWTSMOOS_ANDROID_LOG_FATAL   = 7,
    AWTSMOOS_ANDROID_LOG_SILENT  = 8
} awtsmoos_android_log_priority;

/*
 * We additionally publish the canonical ABI alias names so guest code ported
 * from NDK sources compiles unchanged. Only the names match the ABI; every
 * line of this file is Awtsmoos-authored.
 */
#define ANDROID_LOG_UNKNOWN AWTSMOOS_ANDROID_LOG_UNKNOWN
#define ANDROID_LOG_DEFAULT AWTSMOOS_ANDROID_LOG_DEFAULT
#define ANDROID_LOG_VERBOSE AWTSMOOS_ANDROID_LOG_VERBOSE
#define ANDROID_LOG_DEBUG   AWTSMOOS_ANDROID_LOG_DEBUG
#define ANDROID_LOG_INFO    AWTSMOOS_ANDROID_LOG_INFO
#define ANDROID_LOG_WARN    AWTSMOOS_ANDROID_LOG_WARN
#define ANDROID_LOG_WARNING AWTSMOOS_ANDROID_LOG_WARN
#define ANDROID_LOG_ERROR   AWTSMOOS_ANDROID_LOG_ERROR
#define ANDROID_LOG_FATAL   AWTSMOOS_ANDROID_LOG_FATAL
#define ANDROID_LOG_SILENT  AWTSMOOS_ANDROID_LOG_SILENT

/*
 * Write one pre-formatted line to the log. Returns a non-negative value on
 * success, negative on failure.
 */
int __android_log_write(int prio, const char* tag, const char* text);

/*
 * printf-style write to the log. The format string plus arguments are
 * formatted first, then written as a single line.
 */
int __android_log_print(int prio, const char* tag, const char* fmt, ...)
#if defined(__GNUC__) || defined(__clang__)
    __attribute__((format(printf, 3, 4)))
#endif
    ;

/*
 * va_list variant of __android_log_print.
 */
int __android_log_vprint(int prio, const char* tag, const char* fmt, va_list ap);

/*
 * Logs the given condition as a fatal error, then aborts the process.
 */
void __android_log_assert(const char* cond, const char* tag,
                          const char* fmt, ...)
#if defined(__GNUC__) || defined(__clang__)
    __attribute__((format(printf, 3, 4), noreturn))
#endif
    ;

#ifdef __cplusplus
}
#endif

#endif /* AWTSMOOS_ANDROID_LOG_H */
