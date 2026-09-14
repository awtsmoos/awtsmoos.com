/*B"H*/
/*Boruch Hashem*/
/*Blessed be He*/

#ifndef AWTS_MERKAVA_NATIVE_WEB_INTERNAL_H
#define AWTS_MERKAVA_NATIVE_WEB_INTERNAL_H

#include "merkava_native_reader.h"

#define AWTS_NATIVE_WEB_VERSION 2u
#define AWTS_NATIVE_OP_END 0u
#define AWTS_NATIVE_OP_CREATE_NODE 1u
#define AWTS_NATIVE_OP_SET_ATTR 2u
#define AWTS_NATIVE_OP_SET_STYLE 3u
#define AWTS_NATIVE_OP_BIND_TEXT_EVENT 4u
#define AWTS_NATIVE_OP_SET_STYLE_HANDLE 5u

typedef struct AwtsNativeExecution {
	AwtsNativeReader code;
	AwtsNativeWebRuntime* runtime;
} AwtsNativeExecution;

int awts_native_read_pool(
	AwtsNativeReader* reader,
	AwtsNativeWebRuntime* runtime
);

AwtsNativeSlice awts_native_read_ref(AwtsNativeExecution* execution);
int awts_native_execute_record_op(
	AwtsNativeExecution* execution,
	uint8_t opcode
);
int awts_native_execute_op(AwtsNativeExecution* execution, uint8_t opcode);

#endif
