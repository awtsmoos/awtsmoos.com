/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#include "merkava_native_web_internal.h"

#include <string.h>

int awts_native_web_execute(
	const uint8_t* bytes,
	size_t length,
	AwtsNativeWebRuntime* out
) {
	AwtsNativeReader reader;
	AwtsNativeSlice codeBlock;
	AwtsNativeExecution execution;
	if (!bytes || !out || length < 6) {
		return 0;
	}
	memset(out, 0, sizeof(*out));
	awts_native_reader_init(&reader, bytes, length);
	if (awts_native_read_u8(&reader) != 'M'
		|| awts_native_read_u8(&reader) != 'W'
		|| awts_native_read_u8(&reader) != 'B'
		|| awts_native_read_u8(&reader) != '4') {
		return 0;
	}
	if (awts_native_read_u8(&reader) != AWTS_NATIVE_WEB_VERSION) {
		return 0;
	}
	if (!awts_native_read_pool(&reader, out)) {
		return 0;
	}
	codeBlock = awts_native_read_sized_block(&reader);
	if (!reader.ok || reader.at != reader.length) {
		return 0;
	}
	awts_native_reader_init(&execution.code, codeBlock.bytes, codeBlock.length);
	execution.runtime = out;
	while (execution.code.ok && execution.code.at < execution.code.length) {
		uint8_t opcode = awts_native_read_u8(&execution.code);
		if (!execution.code.ok) {
			return 0;
		}
		out->executedOps += 1;
		if (opcode == AWTS_NATIVE_OP_END) {
			return execution.code.at == execution.code.length;
		}
		if (!awts_native_execute_op(&execution, opcode)) {
			return 0;
		}
	}
	return 0;
}

int awts_native_read_pool(
	AwtsNativeReader* reader,
	AwtsNativeWebRuntime* runtime
) {
	uint32_t count = awts_native_read_varuint(reader);
	if (!reader || !runtime || !reader->ok || count > AWTS_NATIVE_WEB_MAX_STRINGS) {
		return 0;
	}
	runtime->stringCount = count;
	for (uint32_t index = 0; index < count; index += 1) {
		AwtsNativeSlice source = awts_native_read_slice(reader);
		uint32_t start = runtime->stringStorageUsed;
		if (!reader->ok
			|| source.length > AWTS_NATIVE_WEB_STRING_BYTES - start) {
			return 0;
		}
		memcpy(runtime->stringStorage + start, source.bytes, source.length);
		runtime->strings[index].bytes = runtime->stringStorage + start;
		runtime->strings[index].length = source.length;
		runtime->stringStorageUsed += source.length;
	}
	return 1;
}

AwtsNativeSlice awts_native_read_ref(AwtsNativeExecution* execution) {
	AwtsNativeSlice empty = { 0 };
	uint32_t index;
	if (!execution || !execution->runtime) {
		return empty;
	}
	index = awts_native_read_varuint(&execution->code);
	if (!execution->code.ok || index >= execution->runtime->stringCount) {
		execution->code.ok = 0;
		return empty;
	}
	return execution->runtime->strings[index];
}
