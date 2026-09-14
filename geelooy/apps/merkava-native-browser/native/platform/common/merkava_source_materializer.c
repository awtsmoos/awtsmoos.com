/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_source_materializer.h"
#include "merkava_file_loader.h"
#include "../../canonical/merkava_container.h"
#include "../../canonical/merkava_source_archive.h"

#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>

/** Creates all parent directories of one package-owned output path. */
static int ensure_parents(char* path) {
	for (char* cursor = path + 1; *cursor; cursor += 1) {
		if (*cursor != '/') continue;
		*cursor = 0;
		if (mkdir(path, 0700) && access(path, F_OK)) return 0;
		*cursor = '/';
	}
	return 1;
}

/** Copies one bounded source path into a null-terminated host buffer. */
static int copy_path(
	char* output,
	size_t capacity,
	const uint8_t* source,
	uint32_t length
) {
	if (!output || length + 1 > capacity) return 0;
	memcpy(output, source, length);
	output[length] = 0;
	return 1;
}

/** Materializes a verified source record beneath a private temporary root. */
static int write_record(
	const char* root,
	const AwtsMerkavaSourceRecord* record
) {
	char relative[PATH_MAX];
	char output[PATH_MAX];
	if (!copy_path(relative, sizeof(relative), record->path, record->pathLength)) return 0;
	if (snprintf(output, sizeof(output), "%s%s", root, relative) >= (int)sizeof(output)) return 0;
	if (!ensure_parents(output)) return 0;
	FILE* stream = fopen(output, "wb");
	if (!stream) return 0;
	size_t written = fwrite(record->data, 1, record->dataLength, stream);
	int closed = fclose(stream) == 0;
	return written == record->dataLength && closed;
}

/** Extracts the exact SRC1 graph from a CRC-verified canonical package. */
int awts_materialize_merkava_source(
	const char* packagePath,
	char* rootPath,
	size_t rootCapacity,
	char* entryPath,
	size_t entryCapacity
) {
	AwtsFileBytes file;
	if (!awts_read_file_bytes(packagePath, &file)) return 0;
	AwtsMerkavaContainer container;
	AwtsMerkavaSection section;
	int valid = awts_mkv_open(file.bytes, file.length, &container)
		&& awts_mkv_find_section(&container, AWTS_MKV_SECTION_SOURCE, &section);
	AwtsMerkavaSourceArchive archive;
	if (valid) valid = awts_mkv_source_open(
		awts_mkv_section_bytes(&container, &section),
		section.length,
		&archive
	);
	char templatePath[] = "/tmp/merkava-XXXXXX";
	char* root = valid ? mkdtemp(templatePath) : NULL;
	if (!root) valid = 0;
	for (uint32_t index = 0; valid && index < archive.fileCount; index += 1) {
		AwtsMerkavaSourceRecord record;
		valid = awts_mkv_source_record(&archive, index, &record)
			&& write_record(root, &record);
	}
	char entry[PATH_MAX];
	if (valid) valid = copy_path(
		entry,
		sizeof(entry),
		archive.bytes + archive.entryOffset,
		archive.entryLength
	);
	if (valid && snprintf(entryPath, entryCapacity, "%s%s", root, entry) >= (int)entryCapacity) valid = 0;
	if (valid && snprintf(rootPath, rootCapacity, "%s", root) >= (int)rootCapacity) valid = 0;
	awts_free_file_bytes(&file);
	return valid;
}
