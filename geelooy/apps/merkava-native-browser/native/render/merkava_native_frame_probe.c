/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_raster.h"
#include "../vm/merkava_native_canonical.h"

#include <stdio.h>
#include <stdlib.h>

/** Finds one executed DOM node by public id for test assertions only. */
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

/** Finds the retained layout box corresponding to one VM node handle. */
static AwtsNativeBox* find_box(
	AwtsNativeLayout* layout,
	uint32_t handle
) {
	for (uint32_t index = 0; index < layout->boxCount; index += 1) {
		if (layout->boxes[index].nodeHandle == handle) {
			return &layout->boxes[index];
		}
	}
	return NULL;
}

/** Runs one complete native frame, click, mutation, and reraster assertion. */
int main(int argc, char** argv) {
	const uint32_t width = 640u;
	const uint32_t height = 480u;
	AwtsNativeWebRuntime runtime;
	AwtsNativeLayout layout;
	AwtsNativeSurface surface;
	AwtsNativeNode* button;
	AwtsNativeNode* output;
	AwtsNativeBox* buttonBox;
	uint64_t before;
	uint64_t after;
	uint32_t hit;

	if (argc != 2) {
		fprintf(stderr, "usage: merkava-native-frame-probe <app.merkava>\n");
		return 64;
	}
	if (!awts_native_web_execute_canonical_file(argv[1], &runtime)) {
		fprintf(stderr, "native_frame_execute_failed\n");
		return 2;
	}
	if (!awts_native_layout_build(&runtime, width, height, &layout)) {
		fprintf(stderr, "native_frame_layout_failed\n");
		return 3;
	}
	surface.width = width;
	surface.height = height;
	surface.pixels = calloc((size_t)width * height, sizeof(uint32_t));
	if (!surface.pixels) {
		fprintf(stderr, "native_frame_alloc_failed\n");
		return 4;
	}
	if (!awts_native_raster_layout(&layout, &surface)) {
		fprintf(stderr, "native_frame_raster_failed\n");
		free(surface.pixels);
		return 5;
	}
	before = awts_native_surface_hash(&surface);
	button = find_by_id(&runtime, "go");
	output = find_by_id(&runtime, "out");
	buttonBox = button ? find_box(&layout, button->handle) : NULL;
	if (!button || !output || !buttonBox) {
		fprintf(stderr, "native_frame_target_failed\n");
		free(surface.pixels);
		return 6;
	}
	hit = awts_native_layout_hit_test(
		&layout,
		buttonBox->x + buttonBox->width * 0.5f,
		buttonBox->y + buttonBox->height * 0.5f
	);
	if (hit != button->handle || !awts_native_web_trigger(&runtime, hit, "click")) {
		fprintf(stderr, "native_frame_click_failed\n");
		free(surface.pixels);
		return 7;
	}
	if (!awts_native_layout_build(&runtime, width, height, &layout)
		|| !awts_native_raster_layout(&layout, &surface)) {
		fprintf(stderr, "native_frame_rerender_failed\n");
		free(surface.pixels);
		return 8;
	}
	after = awts_native_surface_hash(&surface);
	if (before == after || !awts_native_slice_equals(output->text, "clicked")) {
		fprintf(stderr, "native_frame_mutation_not_visible\n");
		free(surface.pixels);
		return 9;
	}
	printf(
		"native_frame_ok hit=%u before=%llu after=%llu boxes=%u out=%.*s\n",
		hit,
		(unsigned long long)before,
		(unsigned long long)after,
		layout.boxCount,
		(int)output->text.length,
		(const char*)output->text.bytes
	);
	free(surface.pixels);
	return 0;
}
