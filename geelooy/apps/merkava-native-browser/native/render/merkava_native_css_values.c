/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_css_values.h"

/** Parses a non-negative CSS pixel length without host number parsers. */
int awts_native_parse_pixels(AwtsNativeSlice value, float* out) {
	uint32_t at = 0;
	float number = 0.0f;
	float fraction = 0.1f;
	int sawDigit = 0;
	int sawDot = 0;
	if (!out || !value.bytes || !value.length) {
		return 0;
	}
	while (at < value.length) {
		uint8_t character = value.bytes[at];
		if (character >= '0' && character <= '9') {
			sawDigit = 1;
			if (sawDot) {
				number += (float)(character - '0') * fraction;
				fraction *= 0.1f;
			} else {
				number = number * 10.0f + (float)(character - '0');
			}
			at += 1;
			continue;
		}
		if (character == '.' && !sawDot) {
			sawDot = 1;
			at += 1;
			continue;
		}
		break;
	}
	if (!sawDigit) {
		return 0;
	}
	if (at == value.length) {
		*out = number;
		return 1;
	}
	if (
		at + 2 == value.length
		&& value.bytes[at] == 'p'
		&& value.bytes[at + 1] == 'x'
	) {
		*out = number;
		return 1;
	}
	return 0;
}
