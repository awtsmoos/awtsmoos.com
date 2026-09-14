/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_canonical.h"

#include "../canonical/merkava_container.h"
#include "../platform/common/merkava_file_loader.h"

int awts_native_web_execute_canonical_file(
	const char* path,
	AwtsNativeWebRuntime* runtime
) {
	AwtsFileBytes file = { 0 };
	AwtsMerkavaContainer container;
	AwtsMerkavaSection section;
	const uint8_t* bytes;
	int ok = 0;
	if (!path || !runtime || !awts_read_file_bytes(path, &file)) {
		return 0;
	}
	if (!awts_mkv_open(file.bytes, file.length, &container)) {
		goto cleanup;
	}
	if (!awts_mkv_find_section(
		&container,
		AWTS_MKV_SECTION_BYTECODE,
		&section
	)) {
		goto cleanup;
	}
	bytes = awts_mkv_section_bytes(&container, &section);
	if (!bytes) {
		goto cleanup;
	}
	ok = awts_native_web_execute(bytes, section.length, runtime);

cleanup:
	awts_free_file_bytes(&file);
	return ok;
}
