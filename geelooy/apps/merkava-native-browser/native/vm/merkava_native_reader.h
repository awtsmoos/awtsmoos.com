/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_NATIVE_READER_H
#define AWTS_MERKAVA_NATIVE_READER_H

#include "merkava_native_web.h"

typedef struct AwtsNativeReader {
	const uint8_t* bytes;
	size_t length;
	size_t at;
	int ok;
} AwtsNativeReader;

void awts_native_reader_init(
	AwtsNativeReader* reader,
	const uint8_t* bytes,
	size_t length
);

uint8_t awts_native_read_u8(AwtsNativeReader* reader);
uint32_t awts_native_read_varuint(AwtsNativeReader* reader);
AwtsNativeSlice awts_native_read_slice(AwtsNativeReader* reader);
AwtsNativeSlice awts_native_read_sized_block(AwtsNativeReader* reader);

#endif
