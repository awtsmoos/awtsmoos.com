/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_layout_internal.h"

#include <stdlib.h>
#include <string.h>

#define AWTS_NATIVE_LAYOUT_NONE UINT32_MAX

/** Keeps one scalar within the safe visual range expected by the rasterizer. */
static float clamp_min(float value, float minimum) {
	return value < minimum ? minimum : value;
}

/** 32-bit multiplicative hash for the handle index. */
static uint32_t hash_slot(uint32_t handle, uint32_t mask) {
	return (uint32_t)((handle * 2654435761u) & mask);
}

uint32_t awts_native_layout_handle_index(
	const AwtsNativeLayoutScratch* scratch,
	uint32_t handle
) {
	uint32_t slot;
	if (!scratch || !scratch->hashKeys || !handle) {
		return AWTS_NATIVE_LAYOUT_NONE;
	}
	slot = hash_slot(handle, scratch->hashMask);
	for (;;) {
		uint32_t key = scratch->hashKeys[slot];
		if (!key) {
			return AWTS_NATIVE_LAYOUT_NONE;
		}
		if (key == handle) {
			return scratch->hashVals[slot];
		}
		slot = (slot + 1u) & scratch->hashMask;
	}
}

/** Classifies one style property slice into a layout property id. */
static uint8_t classify_property(AwtsNativeSlice property) {
	if (awts_native_slice_equals(property, "display")) {
		return AWTS_NATIVE_PROP_DISPLAY;
	}
	if (awts_native_slice_equals(property, "width")) {
		return AWTS_NATIVE_PROP_WIDTH;
	}
	if (awts_native_slice_equals(property, "height")) {
		return AWTS_NATIVE_PROP_HEIGHT;
	}
	if (awts_native_slice_equals(property, "padding")) {
		return AWTS_NATIVE_PROP_PADDING;
	}
	if (awts_native_slice_equals(property, "background-color")) {
		return AWTS_NATIVE_PROP_BACKGROUND_COLOR;
	}
	if (awts_native_slice_equals(property, "color")) {
		return AWTS_NATIVE_PROP_COLOR;
	}
	return AWTS_NATIVE_PROP_OTHER;
}

int awts_native_layout_scratch_build(
	AwtsNativeLayoutScratch* scratch,
	const AwtsNativeWebRuntime* runtime
) {
	uint32_t nodeCount;
	uint32_t styleCount;
	uint32_t hashCap;
	uint8_t* arena;
	uint8_t* at;
	size_t total;
	uint32_t index;

	if (!scratch || !runtime) {
		return 0;
	}
	memset(scratch, 0, sizeof(*scratch));
	nodeCount = runtime->nodeCount;
	styleCount = runtime->styleCount;
	if (nodeCount > AWTS_NATIVE_WEB_MAX_NODES
		|| styleCount > AWTS_NATIVE_WEB_MAX_STYLES) {
		return 0;
	}
	hashCap = 16u;
	while (hashCap < nodeCount * 2u + 1u) {
		hashCap *= 2u;
	}
	/* One arena: hash keys+vals, child links, style chains, prop ids. */
	total = (size_t)hashCap * 8u
		+ (size_t)(nodeCount ? nodeCount : 1u) * 16u
		+ (size_t)(styleCount ? styleCount : 1u) * 5u;
	arena = (uint8_t*)malloc(total);
	if (!arena) {
		return 0;
	}
	memset(arena, 0, total);
	at = arena;
	scratch->hashKeys = (uint32_t*)at; at += (size_t)hashCap * 4u;
	scratch->hashVals = (uint32_t*)at; at += (size_t)hashCap * 4u;
	scratch->hashMask = hashCap - 1u;
	scratch->firstChild = (uint32_t*)at;
	at += (size_t)(nodeCount ? nodeCount : 1u) * 4u;
	scratch->lastChild = (uint32_t*)at;
	at += (size_t)(nodeCount ? nodeCount : 1u) * 4u;
	scratch->nextSibling = (uint32_t*)at;
	at += (size_t)(nodeCount ? nodeCount : 1u) * 4u;
	scratch->styleHead = (uint32_t*)at;
	at += (size_t)(nodeCount ? nodeCount : 1u) * 4u;
	scratch->styleNext = (uint32_t*)at;
	at += (size_t)(styleCount ? styleCount : 1u) * 4u;
	scratch->propId = (uint8_t*)at;
	scratch->nodeCount = nodeCount;
	scratch->styleCount = styleCount;
	for (index = 0; index < nodeCount; index += 1) {
		scratch->firstChild[index] = AWTS_NATIVE_LAYOUT_NONE;
		scratch->lastChild[index] = AWTS_NATIVE_LAYOUT_NONE;
		scratch->nextSibling[index] = AWTS_NATIVE_LAYOUT_NONE;
		scratch->styleHead[index] = AWTS_NATIVE_LAYOUT_NONE;
	}
	/* Index handles. */
	for (index = 0; index < nodeCount; index += 1) {
		uint32_t handle = runtime->nodes[index].handle;
		uint32_t slot;
		if (!handle) {
			continue;
		}
		slot = hash_slot(handle, scratch->hashMask);
		while (scratch->hashKeys[slot]) {
			if (scratch->hashKeys[slot] == handle) {
				break;
			}
			slot = (slot + 1u) & scratch->hashMask;
		}
		scratch->hashKeys[slot] = handle;
		scratch->hashVals[slot] = index;
	}
	/* Link children in index order (matches the old scan order). */
	for (index = 0; index < nodeCount; index += 1) {
		uint32_t parentHandle = runtime->nodes[index].parentHandle;
		uint32_t parentIndex;
		if (!parentHandle) {
			continue;
		}
		parentIndex = awts_native_layout_handle_index(scratch, parentHandle);
		if (parentIndex == AWTS_NATIVE_LAYOUT_NONE) {
			continue;
		}
		if (scratch->firstChild[parentIndex] == AWTS_NATIVE_LAYOUT_NONE) {
			scratch->firstChild[parentIndex] = index;
			scratch->lastChild[parentIndex] = index;
		} else {
			scratch->nextSibling[scratch->lastChild[parentIndex]] = index;
			scratch->lastChild[parentIndex] = index;
		}
	}
	/* Bucket styles per node, most-recent-first (last style wins). */
	for (index = 0; index < styleCount; index += 1) {
		uint32_t handle = runtime->styles[index].nodeHandle;
		uint32_t nodeIndex;
		if (!handle) {
			continue;
		}
		scratch->propId[index] = classify_property(
			runtime->styles[index].property);
		nodeIndex = awts_native_layout_handle_index(scratch, handle);
		if (nodeIndex == AWTS_NATIVE_LAYOUT_NONE) {
			continue;
		}
		scratch->styleNext[index] = scratch->styleHead[nodeIndex];
		scratch->styleHead[nodeIndex] = index;
	}
	return 1;
}

void awts_native_layout_scratch_free(AwtsNativeLayoutScratch* scratch) {
	if (!scratch) {
		return;
	}
	free(scratch->hashKeys);
	memset(scratch, 0, sizeof(*scratch));
}

/** Allocates one box, spilling from inline storage to a heap arena. */
static AwtsNativeBox* box_alloc(AwtsNativeLayout* layout) {
	uint32_t newCapacity;
	AwtsNativeBox* grown;
	if (layout->boxCount < layout->boxCapacity) {
		return &layout->boxes[layout->boxCount++];
	}
	if (layout->boxCount >= AWTS_NATIVE_LAYOUT_MAX_BOXES_TOTAL) {
		return NULL;
	}
	newCapacity = layout->boxCapacity * 2u;
	if (newCapacity > AWTS_NATIVE_LAYOUT_MAX_BOXES_TOTAL) {
		newCapacity = AWTS_NATIVE_LAYOUT_MAX_BOXES_TOTAL;
	}
	if (!layout->overflowArena) {
		grown = (AwtsNativeBox*)malloc(
			(size_t)newCapacity * sizeof(AwtsNativeBox));
		if (!grown) {
			return NULL;
		}
		memcpy(grown, layout->inlineBoxes,
			(size_t)layout->boxCount * sizeof(AwtsNativeBox));
	} else {
		grown = (AwtsNativeBox*)realloc(layout->overflowArena,
			(size_t)newCapacity * sizeof(AwtsNativeBox));
		if (!grown) {
			return NULL;
		}
	}
	layout->overflowArena = grown;
	layout->boxes = grown;
	layout->boxCapacity = newCapacity;
	return &layout->boxes[layout->boxCount++];
}

/** Recursively lays out one node and its indexed children. */
static int layout_node(
	const AwtsNativeWebRuntime* runtime,
	const AwtsNativeLayoutScratch* scratch,
	uint32_t nodeIndex,
	float x,
	float y,
	float availableWidth,
	uint32_t depth,
	AwtsNativeLayout* layout,
	float* bottom
) {
	const AwtsNativeNode* node;
	AwtsNativeBoxStyle style;
	AwtsNativeBox* box;
	uint32_t boxIndex;
	float contentY;
	float width;
	int childSeen = 0;
	uint32_t child;
	if (!runtime || !scratch || !layout || !bottom
		|| nodeIndex >= scratch->nodeCount
		|| depth > AWTS_NATIVE_LAYOUT_MAX_DEPTH) {
		return 0;
	}
	node = &runtime->nodes[nodeIndex];
	style = awts_native_resolve_box_style_indexed(
		runtime, node, scratch, nodeIndex);
	if (style.hidden || awts_native_is_metadata_node(node)) {
		*bottom = y;
		return 1;
	}
	width = style.hasWidth ? style.width : availableWidth;
	width = clamp_min(width, 1.0f);
	box = box_alloc(layout);
	if (!box) {
		return 0;
	}
	/* NOTE: box is a pointer into a growable arena; child recursion below
	 * may realloc it, so only the index is kept across the child loop. */
	boxIndex = layout->boxCount - 1u;
	box->x = x;
	box->y = y;
	box->width = width;
	box->height = 0.0f; /* filled in below */
	box->background = awts_native_pack_color(style.background);
	box->foreground = awts_native_pack_color(style.foreground);
	box->nodeHandle = node->handle;
	box->padding = style.padding;
	box->textOffset = 0u;
	box->textLength = 0u;
	if (node->text.length && node->text.bytes) {
		const uint8_t* base = runtime->stringStorage;
		const uint8_t* limit = base + AWTS_NATIVE_WEB_STRING_BYTES;
		if (node->text.bytes >= base && node->text.bytes < limit) {
			box->textOffset = (uint32_t)(node->text.bytes - base);
			box->textLength = node->text.length;
		}
	}
	contentY = y + style.padding + (node->text.length ? 18.0f : 0.0f);
	for (child = scratch->firstChild[nodeIndex];
		child != AWTS_NATIVE_LAYOUT_NONE;
		child = scratch->nextSibling[child]) {
		float childBottom = contentY;
		float childWidth = clamp_min(width - style.padding * 2.0f, 1.0f);
		if (!layout_node(
			runtime,
			scratch,
			child,
			x + style.padding,
			contentY,
			childWidth,
			depth + 1u,
			layout,
			&childBottom
		)) {
			return 0;
		}
		if (childBottom > contentY) {
			contentY = childBottom + 6.0f;
			childSeen = 1;
		}
	}
	if (style.hasHeight) {
		box = &layout->boxes[boxIndex];
		box->height = clamp_min(style.height, 1.0f);
	} else if (childSeen) {
		box = &layout->boxes[boxIndex];
		box->height = clamp_min(contentY - y + style.padding - 6.0f, 36.0f);
	} else {
		box = &layout->boxes[boxIndex];
		box->height = clamp_min(
			style.padding * 2.0f + (node->text.length ? 18.0f : 20.0f),
			36.0f);
	}
	*bottom = y + box->height;
	return 1;
}

/** Builds retained boxes for every visual root in deterministic source order. */
int awts_native_layout_build(
	const AwtsNativeWebRuntime* runtime,
	float viewportWidth,
	float viewportHeight,
	AwtsNativeLayout* out
) {
	AwtsNativeLayoutScratch scratch;
	float y = 20.0f;
	uint32_t index;
	int ok = 1;
	if (!runtime || !out || viewportWidth <= 0.0f || viewportHeight <= 0.0f) {
		return 0;
	}
	/* Release any previous overflow arena; the caller must zero-init once. */
	free(out->overflowArena);
	out->boxes = out->inlineBoxes;
	out->boxCapacity = AWTS_NATIVE_LAYOUT_INLINE_BOXES;
	out->boxCount = 0u;
	out->viewportWidth = viewportWidth;
	out->viewportHeight = viewportHeight;
	out->textBase = runtime->stringStorage;
	out->overflowArena = NULL;
	if (!awts_native_layout_scratch_build(&scratch, runtime)) {
		return 0;
	}
	for (index = 0; index < scratch.nodeCount; index += 1) {
		float bottom = y;
		if (runtime->nodes[index].parentHandle) {
			continue;
		}
		if (!layout_node(runtime, &scratch, index, 20.0f, y,
			clamp_min(viewportWidth - 40.0f, 1.0f), 0u, out, &bottom)) {
			ok = 0;
			break;
		}
		if (bottom > y) {
			y = bottom + 12.0f;
		}
	}
	awts_native_layout_scratch_free(&scratch);
	return ok;
}

void awts_native_layout_dispose(AwtsNativeLayout* layout) {
	if (!layout) {
		return;
	}
	free(layout->overflowArena);
	layout->boxes = layout->inlineBoxes;
	layout->boxCapacity = AWTS_NATIVE_LAYOUT_INLINE_BOXES;
	layout->boxCount = 0u;
	layout->textBase = NULL;
	layout->overflowArena = NULL;
}

const AwtsNativeLayout* awts_native_layout_cached(
	const AwtsNativeWebRuntime* runtime,
	float viewportWidth,
	float viewportHeight,
	AwtsNativeLayoutCache* cache
) {
	if (!runtime || !cache
		|| viewportWidth <= 0.0f || viewportHeight <= 0.0f) {
		return NULL;
	}
	if (cache->valid
		&& cache->epoch == runtime->executedOps
		&& cache->viewportWidth == viewportWidth
		&& cache->viewportHeight == viewportHeight) {
		return &cache->layout;
	}
	if (!awts_native_layout_build(
		runtime, viewportWidth, viewportHeight, &cache->layout)) {
		cache->valid = 0;
		return NULL;
	}
	cache->epoch = runtime->executedOps;
	cache->viewportWidth = viewportWidth;
	cache->viewportHeight = viewportHeight;
	cache->valid = 1;
	return &cache->layout;
}

void awts_native_layout_cache_dispose(AwtsNativeLayoutCache* cache) {
	if (!cache) {
		return;
	}
	awts_native_layout_dispose(&cache->layout);
	cache->valid = 0;
}
