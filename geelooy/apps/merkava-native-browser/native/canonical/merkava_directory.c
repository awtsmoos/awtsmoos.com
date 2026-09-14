/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_container_internal.h"

uint16_t awts_mkv_read_u16(const uint8_t* bytes) {
	return (uint16_t)(bytes[0] | ((uint16_t)bytes[1] << 8));
}

uint32_t awts_mkv_read_u32(const uint8_t* bytes) {
	return (uint32_t)bytes[0]
		| ((uint32_t)bytes[1] << 8)
		| ((uint32_t)bytes[2] << 16)
		| ((uint32_t)bytes[3] << 24);
}

static const uint8_t* directory_entry(
	const AwtsMerkavaContainer* container,
	uint16_t index
) {
	return container->bytes
		+ AWTS_MKV_HEADER_BYTES
		+ (size_t)index * AWTS_MKV_DIRECTORY_ENTRY_BYTES;
}

int awts_mkv_read_section(
	const AwtsMerkavaContainer* container,
	uint16_t index,
	AwtsMerkavaSection* out
) {
	const uint8_t* entry = directory_entry(container, index);
	uint32_t reserved = awts_mkv_read_u32(entry + 16);
	out->type = awts_mkv_read_u16(entry);
	out->flags = awts_mkv_read_u16(entry + 2);
	out->offset = awts_mkv_read_u32(entry + 4);
	out->length = awts_mkv_read_u32(entry + 8);
	out->checksum = awts_mkv_read_u32(entry + 12);
	if (!out->type || reserved) {
		return 0;
	}
	if (out->offset < container->payloadOffset) {
		return 0;
	}
	if ((size_t)out->offset + out->length > container->length) {
		return 0;
	}
	return 1;
}

int awts_mkv_validate_sections(AwtsMerkavaContainer* container) {
	for (uint16_t left = 0; left < container->sectionCount; left += 1) {
		AwtsMerkavaSection a;
		if (!awts_mkv_read_section(container, left, &a)) {
			return 0;
		}
		const uint8_t* payload = container->bytes + a.offset;
		if (awts_mkv_crc32(payload, a.length) != a.checksum) {
			return 0;
		}
		for (uint16_t right = 0; right < left; right += 1) {
			AwtsMerkavaSection b;
			if (!awts_mkv_read_section(container, right, &b) || a.type == b.type) {
				return 0;
			}
			uint32_t aEnd = a.offset + a.length;
			uint32_t bEnd = b.offset + b.length;
			if (a.offset < bEnd && b.offset < aEnd) {
				return 0;
			}
		}
	}
	return 1;
}
