/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_container_internal.h"
#include <string.h>

int awts_mkv_open(
	const uint8_t* bytes,
	size_t length,
	AwtsMerkavaContainer* out
) {
	if (!bytes || !out || length < AWTS_MKV_HEADER_BYTES) {
		return 0;
	}
	if (memcmp(bytes, "MKV1", 4) != 0) {
		return 0;
	}
	memset(out, 0, sizeof(*out));
	out->bytes = bytes;
	out->length = length;
	out->containerVersion = bytes[4];
	out->isaVersion = bytes[5];
	out->hostAbiVersion = bytes[6];
	out->flags = bytes[7];
	out->sectionCount = awts_mkv_read_u16(bytes + 8);
	out->payloadOffset = awts_mkv_read_u32(bytes + 24);
	uint32_t directoryBytes = awts_mkv_read_u32(bytes + 20);
	if (awts_mkv_read_u16(bytes + 10) != AWTS_MKV_HEADER_BYTES) {
		return 0;
	}
	if (awts_mkv_read_u32(bytes + 28)) {
		return 0;
	}
	if (awts_mkv_read_u32(bytes + 12) != length) {
		return 0;
	}
	if (awts_mkv_read_u32(bytes + 16) != AWTS_MKV_HEADER_BYTES) {
		return 0;
	}
	if (out->sectionCount > AWTS_MKV_MAX_SECTIONS) {
		return 0;
	}
	if (directoryBytes != out->sectionCount * AWTS_MKV_DIRECTORY_ENTRY_BYTES) {
		return 0;
	}
	if (out->payloadOffset < AWTS_MKV_HEADER_BYTES + directoryBytes) {
		return 0;
	}
	if (out->payloadOffset > length) {
		return 0;
	}
	return awts_mkv_validate_sections(out);
}

int awts_mkv_find_section(
	const AwtsMerkavaContainer* container,
	uint16_t type,
	AwtsMerkavaSection* out
) {
	if (!container || !out) {
		return 0;
	}
	for (uint16_t index = 0; index < container->sectionCount; index += 1) {
		if (awts_mkv_read_section(container, index, out) && out->type == type) {
			return 1;
		}
	}
	return 0;
}

const uint8_t* awts_mkv_section_bytes(
	const AwtsMerkavaContainer* container,
	const AwtsMerkavaSection* section
) {
	if (!container || !section) {
		return NULL;
	}
	return container->bytes + section->offset;
}
