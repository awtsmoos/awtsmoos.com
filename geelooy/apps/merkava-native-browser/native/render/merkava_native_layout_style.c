/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_layout_internal.h"

#include <string.h>

/** Sentinel for "absent" in scratch index tables (mirrors layout.c). */
#define AWTS_NATIVE_LAYOUT_NONE UINT32_MAX

/** Creates one opaque color used by minimal native UA defaults. */
static AwtsNativeColor rgb(uint8_t red, uint8_t green, uint8_t blue) {
	AwtsNativeColor result = { red, green, blue, 255u };
	return result;
}

/** Maps one property slice to its slot, or -1 when uncollected.
 * Length-switched so most candidates cost one integer compare, not six
 * string compares. Only the two length-5 properties need a first-byte check.
 * Result values match AWTS_NATIVE_PROP_* for the six layout properties.
 */
static int property_slot(AwtsNativeSlice property) {
	const uint8_t* bytes = property.bytes;
	switch (property.length) {
	case 5u:
		if (!bytes) {
			return -1;
		}
		if (bytes[0] == 'w' && memcmp(bytes, "width", 5u) == 0) {
			return AWTS_NATIVE_PROP_WIDTH;
		}
		if (bytes[0] == 'c' && memcmp(bytes, "color", 5u) == 0) {
			return AWTS_NATIVE_PROP_COLOR;
		}
		return -1;
	case 6u:
		if (bytes && memcmp(bytes, "height", 6u) == 0) {
			return AWTS_NATIVE_PROP_HEIGHT;
		}
		return -1;
	case 7u:
		if (!bytes) {
			return -1;
		}
		if (memcmp(bytes, "display", 7u) == 0) {
			return AWTS_NATIVE_PROP_DISPLAY;
		}
		if (memcmp(bytes, "padding", 7u) == 0) {
			return AWTS_NATIVE_PROP_PADDING;
		}
		return -1;
	case 16u:
		if (bytes && memcmp(bytes, "background-color", 16u) == 0) {
			return AWTS_NATIVE_PROP_BACKGROUND_COLOR;
		}
		return -1;
	default:
		return -1;
	}
}

/** Chooses a deterministic default background before author styles override it. */
static AwtsNativeColor default_background(const AwtsNativeNode* node) {
	if (awts_native_slice_equals(node->tag, "button")) {
		return rgb(35u, 78u, 122u);
	}
	if (awts_native_slice_equals(node->tag, "output")) {
		return rgb(238u, 243u, 248u);
	}
	if (awts_native_slice_equals(node->tag, "section")) {
		return rgb(250u, 251u, 253u);
	}
	return rgb(245u, 247u, 250u);
}

/** Reads one pixel-valued property into the style record when valid. */
static void apply_length(
	AwtsNativeSlice value,
	float* destination,
	int* hasValue
) {
	float parsed;
	if (awts_native_parse_pixels(value, &parsed)) {
		*destination = parsed;
		if (hasValue) {
			*hasValue = 1;
		}
	}
}

/** Applies parsed values from six collected property slices to one style. */
static AwtsNativeBoxStyle apply_found_values(
	const AwtsNativeNode* node,
	const AwtsNativeSlice* found
) {
	AwtsNativeBoxStyle style = { 0 };
	style.padding = 8.0f;
	style.background = default_background(node);
	style.foreground = awts_native_slice_equals(node->tag, "button")
		? rgb(255u, 255u, 255u)
		: rgb(24u, 28u, 34u);
	style.hidden = awts_native_slice_equals(
		found[AWTS_NATIVE_PROP_DISPLAY],
		"none"
	);
	apply_length(
		found[AWTS_NATIVE_PROP_WIDTH],
		&style.width,
		&style.hasWidth
	);
	apply_length(
		found[AWTS_NATIVE_PROP_HEIGHT],
		&style.height,
		&style.hasHeight
	);
	apply_length(
		found[AWTS_NATIVE_PROP_PADDING],
		&style.padding,
		NULL
	);
	style.background = awts_native_parse_color(
		found[AWTS_NATIVE_PROP_BACKGROUND_COLOR],
		style.background
	);
	style.foreground = awts_native_parse_color(
		found[AWTS_NATIVE_PROP_COLOR],
		style.foreground
	);
	return style;
}

/** Resolves compiler-computed style plus minimal executor-owned UA defaults.
 * Fused single-pass scan: one backward walk over the style records collects
 * the last (highest-index) value for each of the six resolved properties,
 * exiting early once all six are found. Most iterations cost a single
 * integer handle compare. Zero extra memory. Last-wins semantics are
 * identical to awts_native_style_value (backward scan, first hit per slot).
 */
AwtsNativeBoxStyle awts_native_resolve_box_style(
	const AwtsNativeWebRuntime* runtime,
	const AwtsNativeNode* node
) {
	AwtsNativeSlice found[AWTS_NATIVE_PROP_COLOR + 1u];
	uint32_t foundMask = 0u;
	uint32_t wantedMask = 0x3fu;
	uint32_t handle;
	uint32_t index;
	uint32_t slot;
	for (slot = 0u; slot <= AWTS_NATIVE_PROP_COLOR; slot += 1u) {
		found[slot].bytes = NULL;
		found[slot].length = 0u;
	}
	if (runtime && node->handle) {
		handle = node->handle;
		for (index = runtime->styleCount; index > 0u; index -= 1u) {
			const AwtsNativeStyle* record = &runtime->styles[index - 1u];
			int propertySlot;
			if (record->nodeHandle != handle) {
				continue;
			}
			propertySlot = property_slot(record->property);
			if (propertySlot < 0
				|| (foundMask & (1u << (uint32_t)propertySlot))) {
				continue;
			}
			found[propertySlot] = record->value;
			foundMask |= (uint32_t)(1u << (uint32_t)propertySlot);
			if (foundMask == wantedMask) {
				break;
			}
		}
	}
	return apply_found_values(node, found);
}

/** Indexed style resolution using the layout scratch's per-node chains.
 * The scratch chains styles most-recent-first, so the first hit per
 * property is the last record, exactly matching the backwards-scan
 * (last-wins) semantics of awts_native_resolve_box_style. Only the node's
 * own styles are walked: O(styles for this node), no full-array scan.
 */
AwtsNativeBoxStyle awts_native_resolve_box_style_indexed(
	const AwtsNativeWebRuntime* runtime,
	const AwtsNativeNode* node,
	const AwtsNativeLayoutScratch* scratch,
	uint32_t nodeIndex
) {
	AwtsNativeSlice found[AWTS_NATIVE_PROP_COLOR + 1u];
	uint32_t foundMask = 0u;
	uint32_t wantedMask = 0x3fu;
	uint32_t styleIndex;
	uint32_t slot;
	for (slot = 0u; slot <= AWTS_NATIVE_PROP_COLOR; slot += 1u) {
		found[slot].bytes = NULL;
		found[slot].length = 0u;
	}
	if (!runtime || !scratch || nodeIndex >= scratch->nodeCount) {
		return apply_found_values(node, found);
	}
	styleIndex = scratch->styleHead[nodeIndex];
	while (styleIndex != AWTS_NATIVE_LAYOUT_NONE
		&& foundMask != wantedMask) {
		uint8_t propId;
		if (styleIndex >= scratch->styleCount) {
			break;
		}
		propId = scratch->propId[styleIndex];
		if (propId <= AWTS_NATIVE_PROP_COLOR
			&& !(foundMask & (1u << propId))) {
			found[propId] = runtime->styles[styleIndex].value;
			foundMask |= (uint32_t)(1u << propId);
		}
		styleIndex = scratch->styleNext[styleIndex];
	}
	return apply_found_values(node, found);
}

/** Returns nonzero for metadata elements excluded from visual formatting. */
int awts_native_is_metadata_node(const AwtsNativeNode* node) {
	return node && (
		awts_native_slice_equals(node->tag, "meta")
		|| awts_native_slice_equals(node->tag, "title")
	);
}
