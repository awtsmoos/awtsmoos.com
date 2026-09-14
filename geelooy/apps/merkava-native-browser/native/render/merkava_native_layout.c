/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_layout_internal.h"

#include <string.h>
/** Keeps one scalar within the safe visual range expected by the rasterizer. */
static float clamp_min(float value, float minimum) {
	return value < minimum ? minimum : value;
}
/** Recursively lays out one executed DOM node and its handle-addressed children. */
static int layout_node(
	const AwtsNativeWebRuntime* runtime,
	const AwtsNativeNode* node,
	float x,
	float y,
	float availableWidth,
	uint32_t depth,
	AwtsNativeLayout* layout,
	float* bottom
) {
	AwtsNativeBoxStyle style;
	AwtsNativeBox* box;
	float contentY;
	float width;
	int childSeen = 0;
	if (!runtime || !node || !layout || !bottom || depth > AWTS_NATIVE_LAYOUT_MAX_DEPTH) {
		return 0;
	}
	style = awts_native_resolve_box_style(runtime, node);
	if (style.hidden || awts_native_is_metadata_node(node)) {
		*bottom = y;
		return 1;
	}
	if (layout->boxCount >= AWTS_NATIVE_LAYOUT_MAX_BOXES) {
		return 0;
	}
	width = style.hasWidth ? style.width : availableWidth;
	width = clamp_min(width, 1.0f);
	box = &layout->boxes[layout->boxCount++];
	memset(box, 0, sizeof(*box));
	box->nodeHandle = node->handle;
	box->x = x;
	box->y = y;
	box->width = width;
	box->padding = style.padding;
	box->background = style.background;
	box->foreground = style.foreground;
	box->text = node->text;
	contentY = y + style.padding + (node->text.length ? 18.0f : 0.0f);
	for (uint32_t index = 0; index < runtime->nodeCount; index += 1) {
		const AwtsNativeNode* child = &runtime->nodes[index];
		float childBottom = contentY;
		float childWidth = clamp_min(width - style.padding * 2.0f, 1.0f);
		if (child->parentHandle != node->handle) {
			continue;
		}
		if (!layout_node(
			runtime,
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
		box->height = clamp_min(style.height, 1.0f);
	} else if (childSeen) {
		box->height = clamp_min(contentY - y + style.padding - 6.0f, 36.0f);
	} else {
		box->height = clamp_min(style.padding * 2.0f + (node->text.length ? 18.0f : 20.0f), 36.0f);
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
	float y = 20.0f;
	if (!runtime || !out || viewportWidth <= 0.0f || viewportHeight <= 0.0f) {
		return 0;
	}
	memset(out, 0, sizeof(*out));
	out->viewportWidth = viewportWidth;
	out->viewportHeight = viewportHeight;
	for (uint32_t index = 0; index < runtime->nodeCount; index += 1) {
		float bottom = y;
		if (runtime->nodes[index].parentHandle) {
			continue;
		}
		if (!layout_node(runtime, &runtime->nodes[index], 20.0f, y,
			clamp_min(viewportWidth - 40.0f, 1.0f), 0u, out, &bottom)) {
			return 0;
		}
		if (bottom > y) {
			y = bottom + 12.0f;
		}
	}
	return 1;
}
