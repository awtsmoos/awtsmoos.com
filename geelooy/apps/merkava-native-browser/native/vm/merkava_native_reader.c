/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_reader.h"

#include <string.h>

void awts_native_reader_init(
	AwtsNativeReader* reader,
	const uint8_t* bytes,
	size_t length
) {
	if (!reader) {
		return;
	}
	reader->bytes = bytes;
	reader->length = length;
	reader->at = 0;
	reader->ok = bytes != NULL;
}

uint8_t awts_native_read_u8(AwtsNativeReader* reader) {
	if (!reader || !reader->ok || reader->at >= reader->length) {
		if (reader) {
			reader->ok = 0;
		}
		return 0;
	}
	return reader->bytes[reader->at++];
}

uint32_t awts_native_read_varuint(AwtsNativeReader* reader) {
	uint32_t value = 0;
	uint32_t shift = 0;
	for (uint32_t index = 0; index < 5; index += 1) {
		uint8_t byte = awts_native_read_u8(reader);
		if (!reader || !reader->ok) {
			return 0;
		}
		value |= (uint32_t)(byte & 0x7fu) << shift;
		if (!(byte & 0x80u)) {
			return value;
		}
		shift += 7;
	}
	if (reader) {
		reader->ok = 0;
	}
	return 0;
}

AwtsNativeSlice awts_native_read_slice(AwtsNativeReader* reader) {
	AwtsNativeSlice slice = { 0 };
	uint32_t length = awts_native_read_varuint(reader);
	if (!reader || !reader->ok || length > reader->length - reader->at) {
		if (reader) {
			reader->ok = 0;
		}
		return slice;
	}
	slice.bytes = reader->bytes + reader->at;
	slice.length = length;
	reader->at += length;
	return slice;
}

AwtsNativeSlice awts_native_read_sized_block(AwtsNativeReader* reader) {
	return awts_native_read_slice(reader);
}

int awts_native_slice_equals(AwtsNativeSlice slice, const char* text) {
	size_t length = text ? strlen(text) : 0;
	if (length != slice.length) {
		return 0;
	}
	if (!length) {
		return 1;
	}
	return slice.bytes && memcmp(slice.bytes, text, length) == 0;
}
