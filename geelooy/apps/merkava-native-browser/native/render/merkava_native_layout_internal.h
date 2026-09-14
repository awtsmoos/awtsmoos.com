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

#endif
