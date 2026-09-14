/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_SOURCE_ARCHIVE_H
#define AWTS_MERKAVA_SOURCE_ARCHIVE_H

#include <stddef.h>
#include <stdint.h>

typedef struct AwtsMerkavaSourceArchive {
	const uint8_t* bytes;
	size_t length;
	uint32_t fileCount;
	uint32_t entryOffset;
	uint32_t entryLength;
	uint32_t recordsOffset;
} AwtsMerkavaSourceArchive;

typedef struct AwtsMerkavaSourceRecord {
	const uint8_t* path;
	uint32_t pathLength;
	const uint8_t* data;
	uint32_t dataLength;
} AwtsMerkavaSourceRecord;

int awts_mkv_source_open(
	const uint8_t* bytes,
	size_t length,
	AwtsMerkavaSourceArchive* out
);

int awts_mkv_source_record(
	const AwtsMerkavaSourceArchive* archive,
	uint32_t index,
	AwtsMerkavaSourceRecord* out
);

int awts_mkv_source_safe_path(const uint8_t* bytes, uint32_t length);

#endif
