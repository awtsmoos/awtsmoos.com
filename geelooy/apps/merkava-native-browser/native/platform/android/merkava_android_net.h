/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_ANDROID_NET_H
#define AWTS_MERKAVA_ANDROID_NET_H

#include <stddef.h>
#include <stdint.h>
#include <jni.h> /* JavaVM */

struct android_app;

/*
 * HTTPS fetch through the Android platform (java.net.HttpURLConnection
 * via JNI). This gives real TLS, redirects, and proxy support from the
 * OS itself — no third-party TLS stack, no raw sockets.
 *
 * Threading: the _vm variant may be called from ANY thread. It attaches
 * to the JVM only when the calling thread is not already attached, and
 * detaches only threads it attached itself — never the NativeActivity
 * main thread (detaching that thread crashes the process).
 *
 * Returns 1 on HTTP 200 with body bytes (caller frees *outBytes).
 * outFinalUrl receives the post-redirect URL (may equal url).
 */
int awts_net_fetch_vm(JavaVM* vm, const char* url,
	uint8_t** outBytes, size_t* outLen,
	char* outFinalUrl, size_t finalUrlCap);

/*
 * Legacy wrapper: fetches on the calling thread using app->activity->vm.
 * Prefer awts_net_fetch_vm on a worker thread; never call this on the
 * UI thread for real transfers (it blocks).
 */
int awts_net_fetch(struct android_app* app, const char* url,
	uint8_t** outBytes, size_t* outLen,
	char* outFinalUrl, size_t finalUrlCap);

#endif
