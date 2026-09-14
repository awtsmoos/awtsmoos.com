/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_layout.h"

/** Returns the topmost retained box containing one viewport-space point. */
uint32_t awts_native_layout_hit_test(
	const AwtsNativeLayout* layout,
	float x,
	float y
) {
	if (!layout) {
		return 0;
	}
	for (uint32_t index = layout->boxCount; index > 0; index -= 1) {
		const AwtsNativeBox* box = &layout->boxes[index - 1];
		if (x >= box->x
			&& y >= box->y
			&& x < box->x + box->width
			&& y < box->y + box->height) {
			return box->nodeHandle;
		}
	}
	return 0;
}
