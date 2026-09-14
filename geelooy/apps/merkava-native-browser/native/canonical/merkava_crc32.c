/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_container.h"

uint32_t awts_mkv_crc32(const uint8_t* bytes, size_t length) {
	uint32_t value = 0xffffffffu;
	for (size_t index = 0; index < length; index += 1) {
		value ^= bytes[index];
		for (unsigned int bit = 0; bit < 8; bit += 1) {
			uint32_t mask = (uint32_t)-(int32_t)(value & 1u);
			value = (value >> 1) ^ (0xedb88320u & mask);
		}
	}
	return value ^ 0xffffffffu;
}
