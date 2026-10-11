/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_NATIVE_WEB_H
#define AWTS_MERKAVA_NATIVE_WEB_H

#include <stddef.h>
#include <stdint.h>

#define AWTS_NATIVE_WEB_MAX_STRINGS 512u
#define AWTS_NATIVE_WEB_MAX_NODES 16384u
#define AWTS_NATIVE_WEB_MAX_EVENTS 256u
#define AWTS_NATIVE_WEB_MAX_ATTRIBUTES 8192u
#define AWTS_NATIVE_WEB_MAX_STYLES 16384u
#define AWTS_NATIVE_WEB_STRING_BYTES 262144u

typedef struct AwtsNativeSlice {
	const uint8_t* bytes;
	uint32_t length;
} AwtsNativeSlice;

typedef struct AwtsNativeNode {
	uint32_t handle;
	uint32_t parentHandle;
	uint32_t attributeCount;
	/* String-table indices into runtime->strings (was 16B slices; 4B each). */
	uint32_t tagIdx;
	uint32_t idIdx;
	uint32_t textIdx;
} AwtsNativeNode;

typedef struct AwtsNativeTextEvent {
	uint32_t targetHandle;
	uint32_t actionTargetHandle;
	uint32_t eventNameIdx;
	uint32_t valueIdx;
} AwtsNativeTextEvent;

typedef struct AwtsNativeAttribute {
	uint32_t nodeHandle;
	uint32_t nameIdx;
	uint32_t valueIdx;
} AwtsNativeAttribute;

typedef struct AwtsNativeStyle {
	uint32_t nodeHandle;
	uint32_t propertyIdx;
	uint32_t valueIdx;
} AwtsNativeStyle;

typedef struct AwtsNativeWebRuntime {
	AwtsNativeSlice strings[AWTS_NATIVE_WEB_MAX_STRINGS];
	AwtsNativeNode nodes[AWTS_NATIVE_WEB_MAX_NODES];
	AwtsNativeTextEvent events[AWTS_NATIVE_WEB_MAX_EVENTS];
	AwtsNativeAttribute attributes[AWTS_NATIVE_WEB_MAX_ATTRIBUTES];
	AwtsNativeStyle styles[AWTS_NATIVE_WEB_MAX_STYLES];
	uint8_t stringStorage[AWTS_NATIVE_WEB_STRING_BYTES];
	uint32_t stringCount;
	uint32_t stringStorageUsed;
	uint32_t nodeCount;
	uint32_t eventCount;
	uint32_t styleCount;
	uint32_t attributeCount;
	uint32_t executedOps;
} AwtsNativeWebRuntime;

/** Resolves a string-table index to its slice (bounds-checked). */
static inline AwtsNativeSlice awts_native_string_at(
	const AwtsNativeWebRuntime* runtime,
	uint32_t index
) {
	AwtsNativeSlice empty = { 0, 0 };
	if (!runtime || index >= runtime->stringCount) {
		return empty;
	}
	return runtime->strings[index];
}

/** Executes one MWB4 payload into bounded runtime state. */
int awts_native_web_execute(
	const uint8_t* bytes,
	size_t length,
	AwtsNativeWebRuntime* out
);

/** Triggers one compiled text mutation event by numeric target handle. */
int awts_native_web_trigger(
	AwtsNativeWebRuntime* runtime,
	uint32_t targetHandle,
	const char* eventName
);

/** Finds one runtime DOM node by internal handle. */
AwtsNativeNode* awts_native_web_find_node(
	AwtsNativeWebRuntime* runtime,
	uint32_t handle
);

/** Compares one bounded byte slice with a NUL-terminated ASCII/UTF-8 string. */
int awts_native_slice_equals(AwtsNativeSlice slice, const char* text);

#endif
