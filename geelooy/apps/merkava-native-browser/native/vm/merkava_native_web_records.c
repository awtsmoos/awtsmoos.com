/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_web_internal.h"

/** Retains one decoded HTML attribute in bounded runtime-owned state. */
static int execute_set_attribute(AwtsNativeExecution* execution) {
	AwtsNativeWebRuntime* runtime = execution->runtime;
	uint32_t handle = awts_native_read_varuint(&execution->code);
	AwtsNativeNode* node = awts_native_web_find_node(runtime, handle);
	AwtsNativeSlice name = awts_native_read_ref(execution);
	AwtsNativeSlice value = awts_native_read_ref(execution);
	AwtsNativeAttribute* attribute;
	if (!execution->code.ok || !node) {
		return 0;
	}
	if (runtime->attributeCount >= AWTS_NATIVE_WEB_MAX_ATTRIBUTES) {
		return 0;
	}
	attribute = &runtime->attributes[runtime->attributeCount];
	attribute->nodeHandle = handle;
	attribute->name = name;
	attribute->value = value;
	runtime->attributeCount += 1;
	node->attributeCount += 1;
	return 1;
}

/** Retains one selector/property/value record for native style resolution. */
static int execute_set_style(AwtsNativeExecution* execution) {
	AwtsNativeWebRuntime* runtime = execution->runtime;
	AwtsNativeStyle* style;
	AwtsNativeSlice selector = awts_native_read_ref(execution);
	AwtsNativeSlice property = awts_native_read_ref(execution);
	AwtsNativeSlice value = awts_native_read_ref(execution);
	if (!execution->code.ok) {
		return 0;
	}
	if (runtime->styleCount >= AWTS_NATIVE_WEB_MAX_STYLES) {
		return 0;
	}
	style = &runtime->styles[runtime->styleCount];
	style->selector = selector;
	style->property = property;
	style->value = value;
	runtime->styleCount += 1;
	return 1;
}

/** Retains one compiler-resolved style directly against a numeric node handle. */
static int execute_set_style_handle(AwtsNativeExecution* execution) {
	AwtsNativeWebRuntime* runtime = execution->runtime;
	AwtsNativeStyle* style;
	uint32_t handle = awts_native_read_varuint(&execution->code);
	AwtsNativeSlice property = awts_native_read_ref(execution);
	AwtsNativeSlice value = awts_native_read_ref(execution);
	if (!execution->code.ok
		|| !awts_native_web_find_node(runtime, handle)
		|| runtime->styleCount >= AWTS_NATIVE_WEB_MAX_STYLES) {
		return 0;
	}
	style = &runtime->styles[runtime->styleCount];
	style->nodeHandle = handle;
	style->property = property;
	style->value = value;
	runtime->styleCount += 1;
	return 1;
}

/** Dispatches record-producing opcodes outside the core DOM opcode module. */
int awts_native_execute_record_op(
	AwtsNativeExecution* execution,
	uint8_t opcode
) {
	if (!execution || !execution->runtime) {
		return 0;
	}
	if (opcode == AWTS_NATIVE_OP_SET_ATTR) {
		return execute_set_attribute(execution);
	}
	if (opcode == AWTS_NATIVE_OP_SET_STYLE) {
		return execute_set_style(execution);
	}
	if (opcode == AWTS_NATIVE_OP_SET_STYLE_HANDLE) {
		return execute_set_style_handle(execution);
	}
	return 0;
}
