/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_FILE_LOADER_H
#define AWTS_MERKAVA_FILE_LOADER_H

#include <stddef.h>
#include <stdint.h>

/** Owned byte buffer used by platform shells before canonical verification. */
typedef struct AwtsFileBytes {
	uint8_t* bytes;
	size_t length;
} AwtsFileBytes;

/** Reads a complete file into owned memory; returns zero on any I/O failure. */
int awts_read_file_bytes(const char* path, AwtsFileBytes* out);

/** Releases bytes created by awts_read_file_bytes and clears the record. */
void awts_free_file_bytes(AwtsFileBytes* file);

#endif
