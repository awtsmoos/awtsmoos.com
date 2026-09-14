/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_web_internal.h"

static int execute_create_node(AwtsNativeExecution* execution) {
	AwtsNativeWebRuntime* runtime = execution->runtime;
	AwtsNativeNode* node;
	if (runtime->nodeCount >= AWTS_NATIVE_WEB_MAX_NODES) {
		return 0;
	}
	node = &runtime->nodes[runtime->nodeCount];
	node->handle = awts_native_read_varuint(&execution->code);
	node->parentHandle = awts_native_read_varuint(&execution->code);
	node->tag = awts_native_read_ref(execution);
	node->id = awts_native_read_ref(execution);
	node->text = awts_native_read_ref(execution);
	if (!execution->code.ok || !node->handle) {
		return 0;
	}
	if (node->parentHandle
		&& !awts_native_web_find_node(runtime, node->parentHandle)) {
		return 0;
	}
	runtime->nodeCount += 1;
	return 1;
}

static int execute_bind_event(AwtsNativeExecution* execution) {
	AwtsNativeWebRuntime* runtime = execution->runtime;
	AwtsNativeTextEvent* event;
	if (runtime->eventCount >= AWTS_NATIVE_WEB_MAX_EVENTS) {
		return 0;
	}
	event = &runtime->events[runtime->eventCount];
	event->targetHandle = awts_native_read_varuint(&execution->code);
	event->eventName = awts_native_read_ref(execution);
	event->actionTargetHandle = awts_native_read_varuint(&execution->code);
	event->value = awts_native_read_ref(execution);
	if (!execution->code.ok
		|| !awts_native_web_find_node(runtime, event->targetHandle)
		|| !awts_native_web_find_node(runtime, event->actionTargetHandle)) {
		return 0;
	}
	runtime->eventCount += 1;
	return 1;
}

int awts_native_execute_op(AwtsNativeExecution* execution, uint8_t opcode) {
	if (!execution || !execution->runtime) {
		return 0;
	}
	if (opcode == AWTS_NATIVE_OP_CREATE_NODE) {
		return execute_create_node(execution);
	}
	if (opcode == AWTS_NATIVE_OP_SET_ATTR
		|| opcode == AWTS_NATIVE_OP_SET_STYLE
		|| opcode == AWTS_NATIVE_OP_SET_STYLE_HANDLE) {
		return awts_native_execute_record_op(execution, opcode);
	}
	if (opcode == AWTS_NATIVE_OP_BIND_TEXT_EVENT) {
		return execute_bind_event(execution);
	}
	return 0;
}
