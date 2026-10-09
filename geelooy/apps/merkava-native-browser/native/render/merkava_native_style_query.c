/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_style_query.h"

/** Returns an empty immutable slice for failed lookups. */
static AwtsNativeSlice empty_slice(void) {
	AwtsNativeSlice slice = { 0 };
	return slice;
}

/** Returns the last retained HTML attribute value for one node, or empty. */
AwtsNativeSlice awts_native_attribute_value(
	const AwtsNativeWebRuntime* runtime,
	uint32_t nodeHandle,
	const char* name
) {
	if (!runtime || !nodeHandle || !name) {
		return empty_slice();
	}
	for (uint32_t index = runtime->attributeCount; index > 0; index -= 1) {
		const AwtsNativeAttribute* attribute = &runtime->attributes[index - 1];
		if (attribute->nodeHandle == nodeHandle
			&& awts_native_slice_equals(
				awts_native_string_at(runtime, attribute->nameIdx), name)) {
			return awts_native_string_at(runtime, attribute->valueIdx);
		}
	}
	return empty_slice();
}

/** Returns the last compiler-computed style value for one node, or empty. */
AwtsNativeSlice awts_native_style_value(
	const AwtsNativeWebRuntime* runtime,
	uint32_t nodeHandle,
	const char* property
) {
	if (!runtime || !nodeHandle || !property) {
		return empty_slice();
	}
	for (uint32_t index = runtime->styleCount; index > 0; index -= 1) {
		const AwtsNativeStyle* style = &runtime->styles[index - 1];
		if (style->nodeHandle == nodeHandle
			&& awts_native_slice_equals(
				awts_native_string_at(runtime, style->propertyIdx), property)) {
			return awts_native_string_at(runtime, style->valueIdx);
		}
	}
	return empty_slice();
}
