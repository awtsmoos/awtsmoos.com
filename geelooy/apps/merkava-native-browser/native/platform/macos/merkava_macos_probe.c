/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_macos_probe.h"

#include "../../canonical/merkava_container.h"
#include "../../render/merkava_native_frame_cycle.h"
#include "../../vm/merkava_native_canonical.h"
#include "../common/merkava_file_loader.h"

#include <stdio.h>
#include <string.h>

/** Performs structural canonical verification for the lightweight probe. */
static int verify_application(const char* path, uint16_t* sectionCount) {
	AwtsFileBytes file = { 0 };
	AwtsMerkavaContainer container;
	if (!path || !awts_read_file_bytes(path, &file)) {
		return 0;
	}
	int valid = awts_mkv_open(file.bytes, file.length, &container);
	if (valid && sectionCount) {
		*sectionCount = container.sectionCount;
	}
	awts_free_file_bytes(&file);
	return valid;
}

/** Executes the canonical native-web-v4 payload and reports VM state. */
static int execute_probe(const char* path) {
	AwtsNativeWebRuntime runtime;
	if (!awts_native_web_execute_canonical_file(path, &runtime)) {
		return 3;
	}
	printf(
		"native_execute_ok nodes=%u events=%u styles=%u attrs=%u ops=%u\n",
		runtime.nodeCount,
		runtime.eventCount,
		runtime.styleCount,
		runtime.attributeCount,
		runtime.executedOps
	);
	return 0;
}

/** Executes a real render, hit-test, VM click, and rerender evidence cycle. */
static int frame_probe(const char* path) {
	AwtsNativeWebRuntime runtime;
	AwtsNativeFrameCycle cycle;
	if (!awts_native_web_execute_canonical_file(path, &runtime)) {
		return 3;
	}
	if (!awts_native_frame_cycle(&runtime, 640u, 480u, &cycle)) {
		return 4;
	}
	printf(
		"native_frame_ok hit=%u before=%llu after=%llu boxes=%u\n",
		cycle.hitHandle,
		(unsigned long long)cycle.beforeHash,
		(unsigned long long)cycle.afterHash,
		cycle.boxCount
	);
	return 0;
}

/** Handles structural, execution, and visible-frame probe modes. */
int awts_macos_handle_probe_command(
	int argc,
	const char* argv[]
) {
	if (argc < 3) {
		return -1;
	}
	if (strcmp(argv[1], "--probe") == 0) {
		uint16_t count = 0;
		if (!verify_application(argv[2], &count)) {
			return 2;
		}
		printf("merkava_ok sections=%u\n", count);
		return 0;
	}
	if (strcmp(argv[1], "--execute-probe") == 0) {
		return execute_probe(argv[2]);
	}
	if (strcmp(argv[1], "--frame-probe") == 0) {
		return frame_probe(argv[2]);
	}
	return -1;
}
