/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_CONTAINER_INTERNAL_H
#define AWTS_MERKAVA_CONTAINER_INTERNAL_H

#include "merkava_container.h"

uint16_t awts_mkv_read_u16(const uint8_t* bytes);
uint32_t awts_mkv_read_u32(const uint8_t* bytes);

int awts_mkv_read_section(
	const AwtsMerkavaContainer* container,
	uint16_t index,
	AwtsMerkavaSection* out
);

int awts_mkv_validate_sections(
	AwtsMerkavaContainer* container
);

#endif
