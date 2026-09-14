/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_CONTAINER_H
#define AWTS_MERKAVA_CONTAINER_H

#include <stddef.h>
#include <stdint.h>

#define AWTS_MKV_HEADER_BYTES 32u
#define AWTS_MKV_DIRECTORY_ENTRY_BYTES 20u
#define AWTS_MKV_MAX_SECTIONS 128u
#define AWTS_MKV_SECTION_MANIFEST 1u
#define AWTS_MKV_SECTION_BYTECODE 6u
#define AWTS_MKV_SECTION_SOURCE 12u

typedef struct AwtsMerkavaSection {
	uint16_t type;
	uint16_t flags;
	uint32_t offset;
	uint32_t length;
	uint32_t checksum;
} AwtsMerkavaSection;

typedef struct AwtsMerkavaContainer {
	const uint8_t* bytes;
	size_t length;
	uint8_t containerVersion;
	uint8_t isaVersion;
	uint8_t hostAbiVersion;
	uint8_t flags;
	uint16_t sectionCount;
	uint32_t payloadOffset;
} AwtsMerkavaContainer;

uint32_t awts_mkv_crc32(const uint8_t* bytes, size_t length);

int awts_mkv_open(
	const uint8_t* bytes,
	size_t length,
	AwtsMerkavaContainer* out
);

int awts_mkv_find_section(
	const AwtsMerkavaContainer* container,
	uint16_t type,
	AwtsMerkavaSection* out
);

const uint8_t* awts_mkv_section_bytes(
	const AwtsMerkavaContainer* container,
	const AwtsMerkavaSection* section
);

#endif
