/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_file_loader.h"

#include <stdio.h>
#include <stdlib.h>

/** Reads one ordinary file without trusting its declared or inferred format. */
int awts_read_file_bytes(const char* path, AwtsFileBytes* out) {
	if (!path || !out) {
		return 0;
	}
	out->bytes = NULL;
	out->length = 0;
	FILE* file = fopen(path, "rb");
	if (!file) {
		return 0;
	}
	if (fseek(file, 0, SEEK_END) != 0) {
		fclose(file);
		return 0;
	}
	long size = ftell(file);
	if (size <= 0 || fseek(file, 0, SEEK_SET) != 0) {
		fclose(file);
		return 0;
	}
	uint8_t* bytes = (uint8_t*)malloc((size_t)size);
	if (!bytes) {
		fclose(file);
		return 0;
	}
	size_t read = fread(bytes, 1, (size_t)size, file);
	fclose(file);
	if (read != (size_t)size) {
		free(bytes);
		return 0;
	}
	out->bytes = bytes;
	out->length = read;
	return 1;
}

/** Releases one platform file garment after its verifier no longer needs it. */
void awts_free_file_bytes(AwtsFileBytes* file) {
	if (!file) {
		return;
	}
	free(file->bytes);
	file->bytes = NULL;
	file->length = 0;
}
