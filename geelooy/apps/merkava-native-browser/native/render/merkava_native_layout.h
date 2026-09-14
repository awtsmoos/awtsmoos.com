/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_NATIVE_LAYOUT_H
#define AWTS_MERKAVA_NATIVE_LAYOUT_H

#include "merkava_native_css_values.h"

#define AWTS_NATIVE_LAYOUT_MAX_BOXES 1024u
#define AWTS_NATIVE_LAYOUT_MAX_DEPTH 64u

/** One executor-owned rectangular layout box ready for rasterization. */
typedef struct AwtsNativeBox {
	uint32_t nodeHandle;
	float x;
	float y;
	float width;
	float height;
	float padding;
	AwtsNativeColor background;
	AwtsNativeColor foreground;
	AwtsNativeSlice text;
} AwtsNativeBox;

/** Fixed-capacity retained layout result shared by platform presenters. */
typedef struct AwtsNativeLayout {
	AwtsNativeBox boxes[AWTS_NATIVE_LAYOUT_MAX_BOXES];
	uint32_t boxCount;
	float viewportWidth;
	float viewportHeight;
} AwtsNativeLayout;

/** Builds the retained native layout from executed DOM/style state. */
int awts_native_layout_build(
	const AwtsNativeWebRuntime* runtime,
	float viewportWidth,
	float viewportHeight,
	AwtsNativeLayout* out
);

/** Returns the topmost node handle containing one viewport point, or zero. */
uint32_t awts_native_layout_hit_test(
	const AwtsNativeLayout* layout,
	float x,
	float y
);

#endif
