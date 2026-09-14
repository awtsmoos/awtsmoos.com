/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_source_archive.h"
#include <string.h>

static uint32_t read_u32(const uint8_t* bytes) {
	return (uint32_t)bytes[0]
		| ((uint32_t)bytes[1] << 8)
		| ((uint32_t)bytes[2] << 16)
		| ((uint32_t)bytes[3] << 24);
}

static int bounded(size_t offset, size_t length, size_t total) {
	return offset <= total && length <= total - offset;
}

int awts_mkv_source_safe_path(const uint8_t* bytes, uint32_t length) {
	if (!bytes || length < 2 || bytes[0] != '/') return 0;
	uint32_t start = 1;
	for (uint32_t index = 1; index <= length; index += 1) {
		int edge = index == length || bytes[index] == '/';
		if (!edge) {
			if (!bytes[index] || bytes[index] == '\\') return 0;
			continue;
		}
		uint32_t part = index - start;
		if (!part) return 0;
		if (part == 1 && bytes[start] == '.') return 0;
		if (part == 2 && bytes[start] == '.' && bytes[start + 1] == '.') return 0;
		start = index + 1;
	}
	return 1;
}

int awts_mkv_source_open(
	const uint8_t* bytes,
	size_t length,
	AwtsMerkavaSourceArchive* out
) {
	if (!bytes || !out || length < 12 || memcmp(bytes, "SRC1", 4)) return 0;
	uint32_t count = read_u32(bytes + 4);
	uint32_t entryLength = read_u32(bytes + 8);
	if (!bounded(12, entryLength, length)) return 0;
	if (!awts_mkv_source_safe_path(bytes + 12, entryLength)) return 0;
	out->bytes = bytes;
	out->length = length;
	out->fileCount = count;
	out->entryOffset = 12;
	out->entryLength = entryLength;
	out->recordsOffset = 12 + entryLength;
	AwtsMerkavaSourceRecord record;
	for (uint32_t index = 0; index < count; index += 1) {
		if (!awts_mkv_source_record(out, index, &record)) return 0;
	}
	return 1;
}

int awts_mkv_source_record(
	const AwtsMerkavaSourceArchive* archive,
	uint32_t wanted,
	AwtsMerkavaSourceRecord* out
) {
	if (!archive || !out || wanted >= archive->fileCount) return 0;
	size_t offset = archive->recordsOffset;
	for (uint32_t index = 0; index <= wanted; index += 1) {
		if (!bounded(offset, 8, archive->length)) return 0;
		uint32_t pathLength = read_u32(archive->bytes + offset);
		uint32_t dataLength = read_u32(archive->bytes + offset + 4);
		offset += 8;
		if (!bounded(offset, pathLength, archive->length)) return 0;
		const uint8_t* path = archive->bytes + offset;
		if (!awts_mkv_source_safe_path(path, pathLength)) return 0;
		offset += pathLength;
		if (!bounded(offset, dataLength, archive->length)) return 0;
		if (index == wanted) {
			out->path = path;
			out->pathLength = pathLength;
			out->data = archive->bytes + offset;
			out->dataLength = dataLength;
			return 1;
		}
		offset += dataLength;
	}
	return 0;
}
