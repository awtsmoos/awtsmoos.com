/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_NATIVE_STYLE_QUERY_H
#define AWTS_MERKAVA_NATIVE_STYLE_QUERY_H

#include "../vm/merkava_native_web.h"

/** Returns the last retained HTML attribute value for one node, or empty. */
AwtsNativeSlice awts_native_attribute_value(
	const AwtsNativeWebRuntime* runtime,
	uint32_t nodeHandle,
	const char* name
);

/** Returns the last compiler-computed style value for one node, or empty. */
AwtsNativeSlice awts_native_style_value(
	const AwtsNativeWebRuntime* runtime,
	uint32_t nodeHandle,
	const char* property
);

#endif
