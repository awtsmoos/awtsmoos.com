/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_ANDROID_NET_H
#define AWTS_MERKAVA_ANDROID_NET_H

#include <stddef.h>
#include <stdint.h>

struct android_app;

/*
 * HTTPS fetch through the Android platform (java.net.HttpURLConnection
 * via JNI). This gives real TLS, redirects, and proxy support from the
 * OS itself — no third-party TLS stack, no raw sockets.
 *
 * Must be called from the NativeActivity thread (android_main).
 * Blocks until the transfer completes or fails.
 *
 * Returns 1 on HTTP 200 with body bytes (caller frees *outBytes).
 * outFinalUrl receives the post-redirect URL (may equal url).
 */
int awts_net_fetch(struct android_app* app, const char* url,
	uint8_t** outBytes, size_t* outLen,
	char* outFinalUrl, size_t finalUrlCap);

#endif
