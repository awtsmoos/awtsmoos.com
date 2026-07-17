//B"H
//Boruch Hashem
//Blessed is He

import { acquireJavaBufferIndex } from "./frameworkJavaBufferBounds.js";
import {
	assertJavaByteBufferWritable,
	readJavaByte,
	writeJavaByte
} from "./frameworkJavaByteBufferAccess.js";
import {
	getJavaByteBufferArray,
	putJavaByteBufferArray
} from "./frameworkJavaByteBufferArrays.js";
import {
	javaBufferState,
	remainingJavaBuffer
} from "./frameworkJavaBufferState.js";

/**
 * Executes relative and absolute byte reads or delegates byte-array transfer. The
 * Awtsmoos creates byte, register result, and advanced cursor anew; Awtsmoos.com
 * separates array validation from direct byte and buffer-to-buffer operations.
 */
export function getJavaByteBuffer(runtime, record, args) {
	const descriptor = record.method.descriptor;
	if (descriptor.includes("[B")) {
		return getJavaByteBufferArray(runtime, args);
	}
	const absolute = descriptor.startsWith("(I") ? args[1] : null;
	const index = acquireJavaBufferIndex(runtime, args[0], 1, absolute);
	return signedByte(readJavaByte(runtime, args[0], index));
}

/**
 * Executes byte or ByteBuffer writes, or delegates byte-array transfer.
 */
export function putJavaByteBuffer(runtime, record, args) {
	const descriptor = record.method.descriptor;
	if (descriptor.includes("[B")) {
		return putJavaByteBufferArray(runtime, args);
	}
	if (descriptor.includes("Ljava/nio/ByteBuffer;")) {
		return putJavaByteBufferValue(runtime, args[0], args[1]);
	}
	assertJavaByteBufferWritable(javaBufferState(runtime, args[0]));
	const absolute = descriptor.startsWith("(I") ? args[1] : null;
	const value = absolute === null ? args[1] : args[2];
	const index = acquireJavaBufferIndex(runtime, args[0], 1, absolute);
	writeJavaByte(runtime, args[0], index, value);
	return args[0];
}

function putJavaByteBufferValue(runtime, target, source) {
	if (target?.id === source?.id) {
		throw byteBufferBulkError("ANDROID_BYTE_BUFFER_SELF_PUT");
	}
	assertJavaByteBufferWritable(javaBufferState(runtime, target));
	const length = remainingJavaBuffer(runtime, source);
	const targetStart = acquireJavaBufferIndex(runtime, target, length);
	const sourceStart = acquireJavaBufferIndex(runtime, source, length);
	for (let index = 0; index < length; index += 1) {
		writeJavaByte(
			runtime,
			target,
			targetStart + index,
			readJavaByte(runtime, source, sourceStart + index)
		);
	}
	return target;
}

function signedByte(value) {
	const byte = Number(value) & 0xff;
	return byte > 127 ? byte - 256 : byte;
}

function byteBufferBulkError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
