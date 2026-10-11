/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_NATIVE_LAYOUT_H
#define AWTS_MERKAVA_NATIVE_LAYOUT_H

#include "merkava_native_css_values.h"

#define AWTS_NATIVE_LAYOUT_MAX_DEPTH 64u
/** Boxes retained inline; larger pages spill into a heap arena. */
#define AWTS_NATIVE_LAYOUT_INLINE_BOXES 1024u
/** Absolute bound on retained boxes for one layout pass. */
#define AWTS_NATIVE_LAYOUT_MAX_BOXES_TOTAL 65536u

/**
 * One executor-owned rectangular layout box ready for rasterization.
 *
 * Packed to 40 bytes (was 48): text is stored as an offset/length pair
 * into AwtsNativeLayout.textBase instead of a pointer slice, and colors
 * are packed RGBA8 words. Field order keeps 4-byte alignment with no
 * padding.
 */
typedef struct AwtsNativeBox {
	float x;
	float y;
	float width;
	float height;
	uint32_t background; /* packed RGBA8, byte order matches AwtsNativeColor */
	uint32_t foreground; /* packed RGBA8 */
	uint32_t nodeHandle;
	float padding;
	uint32_t textOffset; /* byte offset into AwtsNativeLayout.textBase */
	uint32_t textLength;
} AwtsNativeBox;

/** Fixed-capacity retained layout result shared by platform presenters. */
typedef struct AwtsNativeLayout {
	AwtsNativeBox* boxes; /* inlineBoxes, or heap arena when overflowing */
	AwtsNativeBox inlineBoxes[AWTS_NATIVE_LAYOUT_INLINE_BOXES];
	uint32_t boxCount;
	uint32_t boxCapacity;
	float viewportWidth;
	float viewportHeight;
	const uint8_t* textBase; /* runtime stringStorage; resolves textOffset */
	void* overflowArena; /* heap boxes when boxCount > INLINE, else NULL */
} AwtsNativeLayout;

/**
 * Builds the retained native layout from executed DOM/style state.
 *
 * The output must be zero-initialized before the first call (or be a
 * previous build/dispose result); any previous overflow arena is released
 * before rebuilding, so repeated builds never leak. Call
 * awts_native_layout_dispose when the layout is no longer needed.
 */
int awts_native_layout_build(
	const AwtsNativeWebRuntime* runtime,
	float viewportWidth,
	float viewportHeight,
	AwtsNativeLayout* out
);

/** Releases the heap overflow arena, if any; safe on zeroed layouts. */
void awts_native_layout_dispose(AwtsNativeLayout* layout);

/** Materializes one box's packed text as a slice. */
static inline AwtsNativeSlice awts_native_box_text(
	const AwtsNativeLayout* layout,
	const AwtsNativeBox* box
) {
	AwtsNativeSlice slice = { 0 };
	if (layout && box && box->textLength && layout->textBase) {
		slice.bytes = layout->textBase + box->textOffset;
		slice.length = box->textLength;
	}
	return slice;
}

/** Materializes one packed RGBA8 word as an AwtsNativeColor. */
static inline AwtsNativeColor awts_native_unpack_color(uint32_t packed) {
	AwtsNativeColor color;
	color.red = (uint8_t)(packed & 0xffu);
	color.green = (uint8_t)((packed >> 8) & 0xffu);
	color.blue = (uint8_t)((packed >> 16) & 0xffu);
	color.alpha = (uint8_t)((packed >> 24) & 0xffu);
	return color;
}

/** Packs one AwtsNativeColor into an RGBA8 word. */
static inline uint32_t awts_native_pack_color(AwtsNativeColor color) {
	return (uint32_t)color.red
		| ((uint32_t)color.green << 8)
		| ((uint32_t)color.blue << 16)
		| ((uint32_t)color.alpha << 24);
}

/**
 * Caller-owned layout cache (zero-initialize before first use). Reuses the
 * retained result while the runtime mutation epoch and viewport are
 * unchanged, skipping relayout.
 */
typedef struct AwtsNativeLayoutCache {
	AwtsNativeLayout layout;
	uint32_t epoch;
	float viewportWidth;
	float viewportHeight;
	int valid;
} AwtsNativeLayoutCache;

/**
 * Returns the cached layout, rebuilding only when the runtime changed
 * (executedOps epoch) or the viewport differs. The returned pointer is
 * owned by the cache; call awts_native_layout_cache_dispose to release.
 */
const AwtsNativeLayout* awts_native_layout_cached(
	const AwtsNativeWebRuntime* runtime,
	float viewportWidth,
	float viewportHeight,
	AwtsNativeLayoutCache* cache
);

/** Releases a layout cache and its retained boxes. */
void awts_native_layout_cache_dispose(AwtsNativeLayoutCache* cache);

/** Returns the topmost node handle containing one viewport point, or zero. */
uint32_t awts_native_layout_hit_test(
	const AwtsNativeLayout* layout,
	float x,
	float y
);

#endif
