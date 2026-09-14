/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_frame_cycle.h"

#include <stdlib.h>
#include <string.h>

/** Finds one retained layout box by VM node handle. */
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

/** Allocates one bounded BGRA8 test surface. */
static int allocate_surface(
	uint32_t width,
	uint32_t height,
	AwtsNativeSurface* surface
) {
	if (!surface || !width || !height || width > 16384u || height > 16384u) {
		return 0;
	}
	surface->pixels = calloc((size_t)width * height, sizeof(uint32_t));
	if (!surface->pixels) {
		return 0;
	}
	surface->width = width;
	surface->height = height;
	return 1;
}

/** Runs a complete render, hit-test, click, mutation, and rerender cycle. */
int awts_native_frame_cycle(
	AwtsNativeWebRuntime* runtime,
	uint32_t width,
	uint32_t height,
	AwtsNativeFrameCycle* out
) {
	AwtsNativeLayout layout;
	AwtsNativeSurface surface = { 0 };
	AwtsNativeBox* targetBox;
	uint32_t targetHandle;
	uint32_t hitHandle;
	uint64_t beforeHash;
	uint64_t afterHash;

	if (!runtime || !out || runtime->eventCount == 0u) {
		return 0;
	}
	memset(out, 0, sizeof(*out));
	if (!allocate_surface(width, height, &surface)
		|| !awts_native_layout_build(runtime, width, height, &layout)
		|| !awts_native_raster_layout(&layout, &surface)) {
		free(surface.pixels);
		return 0;
	}
	beforeHash = awts_native_surface_hash(&surface);
	targetHandle = runtime->events[0].targetHandle;
	targetBox = find_box(&layout, targetHandle);
	if (!targetBox) {
		free(surface.pixels);
		return 0;
	}
	hitHandle = awts_native_layout_hit_test(
		&layout,
		targetBox->x + targetBox->width * 0.5f,
		targetBox->y + targetBox->height * 0.5f
	);
	if (hitHandle != targetHandle
		|| !awts_native_web_trigger(runtime, hitHandle, "click")
		|| !awts_native_layout_build(runtime, width, height, &layout)
		|| !awts_native_raster_layout(&layout, &surface)) {
		free(surface.pixels);
		return 0;
	}
	afterHash = awts_native_surface_hash(&surface);
	out->beforeHash = beforeHash;
	out->afterHash = afterHash;
	out->hitHandle = hitHandle;
	out->boxCount = layout.boxCount;
	free(surface.pixels);
	return beforeHash != afterHash;
}
