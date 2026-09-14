/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_layout_internal.h"

/** Creates one opaque color used by minimal native UA defaults. */
static AwtsNativeColor rgb(uint8_t red, uint8_t green, uint8_t blue) {
	AwtsNativeColor result = { red, green, blue, 255u };
	return result;
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

/** Resolves compiler-computed style plus minimal executor-owned UA defaults. */
AwtsNativeBoxStyle awts_native_resolve_box_style(
	const AwtsNativeWebRuntime* runtime,
	const AwtsNativeNode* node
) {
	AwtsNativeBoxStyle style = { 0 };
	AwtsNativeSlice value;
	style.padding = 8.0f;
	style.background = default_background(node);
	style.foreground = awts_native_slice_equals(node->tag, "button")
		? rgb(255u, 255u, 255u)
		: rgb(24u, 28u, 34u);
	value = awts_native_style_value(runtime, node->handle, "display");
	style.hidden = awts_native_slice_equals(value, "none");
	apply_length(
		awts_native_style_value(runtime, node->handle, "width"),
		&style.width,
		&style.hasWidth
	);
	apply_length(
		awts_native_style_value(runtime, node->handle, "height"),
		&style.height,
		&style.hasHeight
	);
	apply_length(
		awts_native_style_value(runtime, node->handle, "padding"),
		&style.padding,
		NULL
	);
	style.background = awts_native_parse_color(
		awts_native_style_value(runtime, node->handle, "background-color"),
		style.background
	);
	style.foreground = awts_native_parse_color(
		awts_native_style_value(runtime, node->handle, "color"),
		style.foreground
	);
	return style;
}

/** Returns nonzero for metadata elements excluded from visual formatting. */
int awts_native_is_metadata_node(const AwtsNativeNode* node) {
	return node && (
		awts_native_slice_equals(node->tag, "meta")
		|| awts_native_slice_equals(node->tag, "title")
	);
}
