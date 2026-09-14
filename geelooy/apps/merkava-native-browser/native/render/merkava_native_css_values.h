/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_NATIVE_CSS_VALUES_H
#define AWTS_MERKAVA_NATIVE_CSS_VALUES_H

#include "../vm/merkava_native_web.h"

/** Four-channel color used by the executor-owned CPU rasterizer. */
typedef struct AwtsNativeColor {
	uint8_t red;
	uint8_t green;
	uint8_t blue;
	uint8_t alpha;
} AwtsNativeColor;

/** Parses a non-negative CSS pixel length such as 120px or 0. */
int awts_native_parse_pixels(AwtsNativeSlice value, float* out);

/** Parses #rgb, #rrggbb, and core named colors; otherwise returns fallback. */
AwtsNativeColor awts_native_parse_color(
	AwtsNativeSlice value,
	AwtsNativeColor fallback
);

#endif
