/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_container.h"
#include <stdio.h>
#include <stdlib.h>

static uint8_t* read_file(const char* path, size_t* length) {
	FILE* file = fopen(path, "rb");
	if (!file) {
		return NULL;
	}
	fseek(file, 0, SEEK_END);
	long size = ftell(file);
	fseek(file, 0, SEEK_SET);
	if (size <= 0) {
		fclose(file);
		return NULL;
	}
	uint8_t* bytes = (uint8_t*)malloc((size_t)size);
	if (!bytes) {
		fclose(file);
		return NULL;
	}
	if (fread(bytes, 1, (size_t)size, file) != (size_t)size) {
		free(bytes);
		fclose(file);
		return NULL;
	}
	fclose(file);
	*length = (size_t)size;
	return bytes;
}

int main(int argc, char** argv) {
	if (argc != 2) {
		fprintf(stderr, "usage: merkava_container_probe file.merkava\n");
		return 64;
	}
	size_t length = 0;
	uint8_t* bytes = read_file(argv[1], &length);
	if (!bytes) {
		fprintf(stderr, "read_failed\n");
		return 65;
	}
	AwtsMerkavaContainer container;
	if (!awts_mkv_open(bytes, length, &container)) {
		fprintf(stderr, "merkava_invalid\n");
		free(bytes);
		return 66;
	}
	AwtsMerkavaSection manifest;
	AwtsMerkavaSection bytecode;
	int hasManifest = awts_mkv_find_section(
		&container,
		AWTS_MKV_SECTION_MANIFEST,
		&manifest
	);
	int hasBytecode = awts_mkv_find_section(
		&container,
		AWTS_MKV_SECTION_BYTECODE,
		&bytecode
	);
	printf(
		"ok sections=%u manifest=%u bytecode=%u bytes=%zu\n",
		container.sectionCount,
		hasManifest ? manifest.length : 0,
		hasBytecode ? bytecode.length : 0,
		length
	);
	free(bytes);
	return hasManifest && hasBytecode ? 0 : 67;
}
