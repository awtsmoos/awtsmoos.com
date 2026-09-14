/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_NATIVE_FRAME_CYCLE_H
#define AWTS_MERKAVA_NATIVE_FRAME_CYCLE_H

#include "merkava_native_raster.h"

/** Evidence emitted by one complete render, click, mutation, and rerender cycle. */
typedef struct AwtsNativeFrameCycle {
	uint64_t beforeHash;
	uint64_t afterHash;
	uint32_t hitHandle;
	uint32_t boxCount;
} AwtsNativeFrameCycle;

/** Runs a bounded first-click frame cycle through the actual native runtime. */
int awts_native_frame_cycle(
	AwtsNativeWebRuntime* runtime,
	uint32_t width,
	uint32_t height,
	AwtsNativeFrameCycle* out
);

#endif
