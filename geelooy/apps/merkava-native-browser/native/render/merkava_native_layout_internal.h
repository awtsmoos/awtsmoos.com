/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_NATIVE_LAYOUT_INTERNAL_H
#define AWTS_MERKAVA_NATIVE_LAYOUT_INTERNAL_H

#include "merkava_native_layout.h"
#include "merkava_native_style_query.h"

/** Resolved formatting inputs consumed by the bounded box-layout algorithm. */
typedef struct AwtsNativeBoxStyle {
	float width;
	float height;
	float padding;
	int hasWidth;
	int hasHeight;
	int hidden;
	AwtsNativeColor background;
	AwtsNativeColor foreground;
} AwtsNativeBoxStyle;

/** Resolves compiler-computed style plus minimal executor-owned UA defaults. */
AwtsNativeBoxStyle awts_native_resolve_box_style(
	const AwtsNativeWebRuntime* runtime,
	const AwtsNativeNode* node
);

/** Returns nonzero for metadata elements excluded from visual formatting. */
int awts_native_is_metadata_node(const AwtsNativeNode* node);

/** Layout-relevant property ids; 255 means "ignored by layout". */
enum {
	AWTS_NATIVE_PROP_DISPLAY = 0,
	AWTS_NATIVE_PROP_WIDTH = 1,
	AWTS_NATIVE_PROP_HEIGHT = 2,
	AWTS_NATIVE_PROP_PADDING = 3,
	AWTS_NATIVE_PROP_BACKGROUND_COLOR = 4,
	AWTS_NATIVE_PROP_COLOR = 5,
	AWTS_NATIVE_PROP_OTHER = 255
};

/**
 * Per-build scratch giving O(1) child and style lookups.
 *
 * Built once per awts_native_layout_build in a single arena allocation:
 * - handleHash maps node handle -> node index (open addressing, 0 = empty).
 * - firstChild/lastChild/nextSibling form order-preserving child lists.
 * - styleHead/styleNext chain styles per node, most-recent-first, so the
 *   first property hit during a walk matches the old backwards-scan
 *   (last style wins) semantics exactly.
 * - propId classifies each style's property once (see enum above).
 */
typedef struct AwtsNativeLayoutScratch {
	uint32_t* hashKeys;
	uint32_t* hashVals;
	uint32_t hashMask;
	uint32_t* firstChild;
	uint32_t* lastChild;
	uint32_t* nextSibling;
	uint32_t* styleHead;
	uint32_t* styleNext;
	uint8_t* propId;
	uint32_t nodeCount;
	uint32_t styleCount;
} AwtsNativeLayoutScratch;

/** Builds scratch indexes for one layout pass; single malloc, free with below. */
int awts_native_layout_scratch_build(
	AwtsNativeLayoutScratch* scratch,
	const AwtsNativeWebRuntime* runtime
);

/** Releases one scratch arena. */
void awts_native_layout_scratch_free(AwtsNativeLayoutScratch* scratch);

/** Maps a node handle to its node index, or UINT32_MAX when absent. */
uint32_t awts_native_layout_handle_index(
	const AwtsNativeLayoutScratch* scratch,
	uint32_t handle
);

/**
 * Indexed style resolution: identical results to
 * awts_native_resolve_box_style, but walks only the node's own style
 * chain instead of scanning every style record.
 */
AwtsNativeBoxStyle awts_native_resolve_box_style_indexed(
	const AwtsNativeWebRuntime* runtime,
	const AwtsNativeNode* node,
	const AwtsNativeLayoutScratch* scratch,
	uint32_t nodeIndex
);

#endif
