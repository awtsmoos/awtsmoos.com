/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_NATIVE_CANONICAL_H
#define AWTS_MERKAVA_NATIVE_CANONICAL_H

#include "merkava_native_web.h"

/** Loads, verifies, extracts, and executes native-web-v4 from one MKV1 file. */
int awts_native_web_execute_canonical_file(
	const char* path,
	AwtsNativeWebRuntime* runtime
);

#endif
