/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_web.h"

AwtsNativeNode* awts_native_web_find_node(
	AwtsNativeWebRuntime* runtime,
	uint32_t handle
) {
	if (!runtime || !handle) {
		return NULL;
	}
	for (uint32_t index = 0; index < runtime->nodeCount; index += 1) {
		if (runtime->nodes[index].handle == handle) {
			return &runtime->nodes[index];
		}
	}
	return NULL;
}

int awts_native_web_trigger(
	AwtsNativeWebRuntime* runtime,
	uint32_t targetHandle,
	const char* eventName
) {
	if (!runtime || !targetHandle || !eventName) {
		return 0;
	}
	for (uint32_t index = 0; index < runtime->eventCount; index += 1) {
		AwtsNativeTextEvent* event = &runtime->events[index];
		if (event->targetHandle != targetHandle
			|| !awts_native_slice_equals(event->eventName, eventName)) {
			continue;
		}
		AwtsNativeNode* target = awts_native_web_find_node(
			runtime,
			event->actionTargetHandle
		);
		if (!target) {
			return 0;
		}
		target->text = event->value;
		return 1;
	}
	return 0;
}
