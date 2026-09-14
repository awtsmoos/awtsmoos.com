/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_css_values.h"

/** Creates one opaque executor color without host graphics conversion. */
static AwtsNativeColor color(uint8_t red, uint8_t green, uint8_t blue) {
	AwtsNativeColor result = { red, green, blue, 255u };
	return result;
}

/** Converts one ASCII hexadecimal digit, returning -1 for invalid input. */
static int nibble(uint8_t value) {
	if (value >= '0' && value <= '9') {
		return value - '0';
	}
	if (value >= 'a' && value <= 'f') {
		return value - 'a' + 10;
	}
	if (value >= 'A' && value <= 'F') {
		return value - 'A' + 10;
	}
	return -1;
}

/** Parses #rgb and #rrggbb directly from bounded UTF-8 bytes. */
static int parse_hex_color(AwtsNativeSlice value, AwtsNativeColor* out) {
	if (!out || !value.bytes || value.bytes[0] != '#') {
		return 0;
	}
	if (value.length == 4) {
		int r = nibble(value.bytes[1]);
		int g = nibble(value.bytes[2]);
		int b = nibble(value.bytes[3]);
		if (r < 0 || g < 0 || b < 0) {
			return 0;
		}
		*out = color((uint8_t)(r * 17), (uint8_t)(g * 17), (uint8_t)(b * 17));
		return 1;
	}
	return 0;
}

/** Parses the six-digit hexadecimal form after the short form was excluded. */
static int parse_long_hex_color(AwtsNativeSlice value, AwtsNativeColor* out) {
	int digits[6];
	if (!out || !value.bytes || value.length != 7 || value.bytes[0] != '#') {
		return 0;
	}
	for (uint32_t index = 0; index < 6; index += 1) {
		digits[index] = nibble(value.bytes[index + 1]);
		if (digits[index] < 0) {
			return 0;
		}
	}
	*out = color(
		(uint8_t)((digits[0] << 4) | digits[1]),
		(uint8_t)((digits[2] << 4) | digits[3]),
		(uint8_t)((digits[4] << 4) | digits[5])
	);
	return 1;
}

/** Parses core named colors needed by the first native renderer foundation. */
static int parse_named_color(AwtsNativeSlice value, AwtsNativeColor* out) {
	if (awts_native_slice_equals(value, "black")) {
		*out = color(0u, 0u, 0u);
		return 1;
	}
	if (awts_native_slice_equals(value, "white")) {
		*out = color(255u, 255u, 255u);
		return 1;
	}
	if (awts_native_slice_equals(value, "red")) {
		*out = color(255u, 0u, 0u);
		return 1;
	}
	if (awts_native_slice_equals(value, "blue")) {
		*out = color(0u, 0u, 255u);
		return 1;
	}
	return 0;
}

/** Parses executor-supported CSS colors and preserves the caller fallback. */
AwtsNativeColor awts_native_parse_color(
	AwtsNativeSlice value,
	AwtsNativeColor fallback
) {
	AwtsNativeColor parsed;
	if (parse_hex_color(value, &parsed)
		|| parse_long_hex_color(value, &parsed)
		|| parse_named_color(value, &parsed)) {
		return parsed;
	}
	return fallback;
}
