/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_canonical.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static AwtsNativeNode* find_by_id(
	AwtsNativeWebRuntime* runtime,
	const char* id
) {
	for (uint32_t index = 0; index < runtime->nodeCount; index += 1) {
		if (awts_native_slice_equals(runtime->nodes[index].id, id)) {
			return &runtime->nodes[index];
		}
	}
	return NULL;
}

int main(int argc, char** argv) {
	AwtsNativeWebRuntime runtime;
	AwtsNativeNode* button;
	AwtsNativeNode* output;
	if (argc != 2) {
		fprintf(stderr, "usage: merkava-native-web-probe <app.merkava>\n");
		return 64;
	}
	if (!awts_native_web_execute_canonical_file(argv[1], &runtime)) {
		fprintf(stderr, "native_web_execute_failed\n");
		return 2;
	}
	void* churn = malloc(1024u * 1024u);
	if (!churn) {
		return 6;
	}
	memset(churn, 0xA5, 1024u * 1024u);
	free(churn);
	button = find_by_id(&runtime, "go");
	output = find_by_id(&runtime, "out");
	if (!button || !output || !awts_native_slice_equals(output->text, "ready")) {
		fprintf(stderr, "native_web_initial_state_failed\n");
		return 3;
	}
	if (!awts_native_web_trigger(&runtime, button->handle, "click")) {
		fprintf(stderr, "native_web_event_failed\n");
		return 4;
	}
	if (!awts_native_slice_equals(output->text, "clicked")) {
		fprintf(stderr, "native_web_mutation_failed\n");
		return 5;
	}
	printf(
		"native_web_ok nodes=%u events=%u styles=%u attrs=%u ops=%u out=%.*s\n",
		runtime.nodeCount,
		runtime.eventCount,
		runtime.styleCount,
		runtime.attributeCount,
		runtime.executedOps,
		(int)output->text.length,
		(const char*)output->text.bytes
	);
	return 0;
}
