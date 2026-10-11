/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_android_net.h"

#include <android/log.h>
#include <android_native_app_glue.h>
#include <jni.h>

#include <stdlib.h>
#include <string.h>

#define AWTS_NET_LOG(...) \
	__android_log_print(ANDROID_LOG_INFO, "MerkavaNet", __VA_ARGS__)

#define AWTS_NET_MAX_BODY (4u * 1024u * 1024u) /* 4MB cap per page */

int awts_net_fetch_vm(JavaVM* vm, const char* url,
	uint8_t** outBytes, size_t* outLen,
	char* outFinalUrl, size_t finalUrlCap) {
	if (!vm || !url || !outBytes || !outLen) {
		return 0;
	}
	*outBytes = NULL;
	*outLen = 0;
	if (outFinalUrl && finalUrlCap) {
		strncpy(outFinalUrl, url, finalUrlCap - 1);
		outFinalUrl[finalUrlCap - 1] = 0;
	}

	/*
	 * Attach discipline (this was the "keeps stopping" crash):
	 * the NativeActivity main thread is ALREADY attached by the
	 * framework. AttachCurrentThread on it is a harmless no-op, but
	 * the old code then called DetachCurrentThread unconditionally —
	 * detaching the main thread, after which every framework JNI
	 * call on it crashes the process. So: attach only when detached,
	 * detach only what we attached.
	 */
	JNIEnv* env = NULL;
	int attachedHere = 0;
	jint genv = (*vm)->GetEnv(vm, (void**)&env, JNI_VERSION_1_6);
	if (genv == JNI_EDETACHED) {
		if ((*vm)->AttachCurrentThread(vm, &env, NULL) != JNI_OK
			|| !env) {
			AWTS_NET_LOG("attach_failed");
			return 0;
		}
		attachedHere = 1;
	} else if (genv != JNI_OK || !env) {
		AWTS_NET_LOG("getenv_failed=%d", (int)genv);
		return 0;
	}

	int ok = 0;
	uint8_t* body = NULL;
	size_t bodyLen = 0;

	jclass urlCls = (*env)->FindClass(env, "java/net/URL");
	jclass connCls = (*env)->FindClass(env, "java/net/HttpURLConnection");
	jclass streamCls = (*env)->FindClass(env, "java/io/InputStream");
	jclass baosCls = (*env)->FindClass(env, "java/io/ByteArrayOutputStream");
	if (!urlCls || !connCls || !streamCls || !baosCls) {
		AWTS_NET_LOG("findclass_failed");
		goto done;
	}

	jmethodID urlCtor = (*env)->GetMethodID(env, urlCls, "<init>",
		"(Ljava/lang/String;)V");
	jmethodID openConn = (*env)->GetMethodID(env, urlCls, "openConnection",
		"()Ljava/net/URLConnection;");
	jmethodID setFollow = (*env)->GetMethodID(env, connCls,
		"setInstanceFollowRedirects", "(Z)V");
	jmethodID setConnTO = (*env)->GetMethodID(env, connCls,
		"setConnectTimeout", "(I)V");
	jmethodID setReadTO = (*env)->GetMethodID(env, connCls,
		"setReadTimeout", "(I)V");
	jmethodID setProp = (*env)->GetMethodID(env, connCls,
		"setRequestProperty", "(Ljava/lang/String;Ljava/lang/String;)V");
	jmethodID getCode = (*env)->GetMethodID(env, connCls,
		"getResponseCode", "()I");
	jmethodID getStream = (*env)->GetMethodID(env, connCls,
		"getInputStream", "()Ljava/io/InputStream;");
	jmethodID getURL = (*env)->GetMethodID(env, connCls,
		"getURL", "()Ljava/net/URL;");
	jmethodID urlToString = (*env)->GetMethodID(env, urlCls,
		"toString", "()Ljava/lang/String;");
	jmethodID streamRead = (*env)->GetMethodID(env, streamCls,
		"read", "([B)I");
	jmethodID baosCtor = (*env)->GetMethodID(env, baosCls, "<init>", "()V");
	jmethodID baosWrite = (*env)->GetMethodID(env, baosCls,
		"write", "([BII)V");
	jmethodID baosBytes = (*env)->GetMethodID(env, baosCls,
		"toByteArray", "()[B");
	if (!urlCtor || !openConn || !setFollow || !setConnTO || !setReadTO
		|| !setProp || !getCode || !getStream || !getURL
		|| !urlToString || !streamRead || !baosCtor || !baosWrite
		|| !baosBytes) {
		AWTS_NET_LOG("methodid_failed");
		goto done;
	}

	jstring jurl = (*env)->NewStringUTF(env, url);
	if (!jurl) goto done;
	jobject urlObj = (*env)->NewObject(env, urlCls, urlCtor, jurl);
	(*env)->DeleteLocalRef(env, jurl);
	if (!urlObj || (*env)->ExceptionCheck(env)) {
		AWTS_NET_LOG("url_ctor_failed");
		(*env)->ExceptionClear(env);
		goto done;
	}
	jobject conn = (*env)->CallObjectMethod(env, urlObj, openConn);
	if (!conn || (*env)->ExceptionCheck(env)) {
		AWTS_NET_LOG("openconn_failed");
		(*env)->ExceptionClear(env);
		goto done;
	}
	(*env)->CallVoidMethod(env, conn, setFollow, JNI_TRUE);
	(*env)->CallVoidMethod(env, conn, setConnTO, 15000);
	(*env)->CallVoidMethod(env, conn, setReadTO, 15000);
	jstring kUA = (*env)->NewStringUTF(env, "User-Agent");
	jstring vUA = (*env)->NewStringUTF(env, "MerkavaBrowser/1.0");
	if (kUA && vUA)
		(*env)->CallVoidMethod(env, conn, setProp, kUA, vUA);
	if (kUA) (*env)->DeleteLocalRef(env, kUA);
	if (vUA) (*env)->DeleteLocalRef(env, vUA);

	jint code = (*env)->CallIntMethod(env, conn, getCode);
	if ((*env)->ExceptionCheck(env)) {
		AWTS_NET_LOG("getcode_exception");
		(*env)->ExceptionClear(env);
		goto done;
	}
	AWTS_NET_LOG("http_code=%d url=%s", (int)code, url);
	if (code != 200) goto done;

	/* Final (post-redirect) URL. */
	jobject finalUrlObj = (*env)->CallObjectMethod(env, conn, getURL);
	if (finalUrlObj && !(*env)->ExceptionCheck(env)) {
		jstring fstr = (*env)->CallObjectMethod(env, finalUrlObj,
			urlToString);
		if (fstr && !(*env)->ExceptionCheck(env) && outFinalUrl
			&& finalUrlCap) {
			const char* cstr = (*env)->GetStringUTFChars(env, fstr,
				NULL);
			if (cstr) {
				strncpy(outFinalUrl, cstr, finalUrlCap - 1);
				outFinalUrl[finalUrlCap - 1] = 0;
				(*env)->ReleaseStringUTFChars(env, fstr, cstr);
			}
		}
		if ((*env)->ExceptionCheck(env)) (*env)->ExceptionClear(env);
	}

	jobject stream = (*env)->CallObjectMethod(env, conn, getStream);
	if (!stream || (*env)->ExceptionCheck(env)) {
		AWTS_NET_LOG("getstream_failed");
		(*env)->ExceptionClear(env);
		goto done;
	}
	jobject baos = (*env)->NewObject(env, baosCls, baosCtor);
	jbyteArray chunk = (*env)->NewByteArray(env, 16384);
	if (!baos || !chunk) goto done;

	for (;;) {
		jint n = (*env)->CallIntMethod(env, stream, streamRead, chunk);
		if ((*env)->ExceptionCheck(env)) {
			(*env)->ExceptionClear(env);
			break;
		}
		if (n <= 0) break;
		if (bodyLen + (size_t)n > AWTS_NET_MAX_BODY) {
			AWTS_NET_LOG("body_too_large");
			break;
		}
		(*env)->CallVoidMethod(env, baos, baosWrite, chunk, 0, n);
		bodyLen += (size_t)n;
	}
	jbyteArray jbytes = (*env)->CallObjectMethod(env, baos, baosBytes);
	if (jbytes && !(*env)->ExceptionCheck(env)) {
		jsize jl = (*env)->GetArrayLength(env, jbytes);
		jbyte* raw = (*env)->GetByteArrayElements(env, jbytes, NULL);
		if (raw && jl > 0) {
			body = (uint8_t*)malloc((size_t)jl + 1);
			if (body) {
				memcpy(body, raw, (size_t)jl);
				body[jl] = 0;
				bodyLen = (size_t)jl;
				ok = 1;
			}
			(*env)->ReleaseByteArrayElements(env, jbytes, raw,
				JNI_ABORT);
		}
	}
	if ((*env)->ExceptionCheck(env)) (*env)->ExceptionClear(env);

done:
	if (attachedHere)
		(*vm)->DetachCurrentThread(vm);
	if (ok) {
		*outBytes = body;
		*outLen = bodyLen;
		AWTS_NET_LOG("fetch_ok bytes=%zu", bodyLen);
	} else {
		free(body);
	}
	return ok;
}

int awts_net_fetch(struct android_app* app, const char* url,
	uint8_t** outBytes, size_t* outLen,
	char* outFinalUrl, size_t finalUrlCap) {
	if (!app || !app->activity || !app->activity->vm)
		return 0;
	return awts_net_fetch_vm(app->activity->vm, url, outBytes, outLen,
		outFinalUrl, finalUrlCap);
}
