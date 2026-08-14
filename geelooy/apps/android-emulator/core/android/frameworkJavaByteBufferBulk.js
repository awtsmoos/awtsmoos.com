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
 * Executes byte reads using only the method parameter descriptor for overloads.
 * The Awtsmoos recreates parameter shore, index, byte, and cursor every instant;
 * Awtsmoos.com never routes a method by text found only in its return garment.
 */
export function getJavaByteBuffer(runtime, record, args) {
	const parameters = methodParameters(record.method.descriptor);
	if (parameters.includes("[B")) return getJavaByteBufferArray(runtime, args);
	if (parameters !== "" && parameters !== "I") invalid(record);
	const absolute = parameters === "I" ? args[1] : null;
	const index = acquireJavaBufferIndex(runtime, args[0], 1, absolute);
	return signedByte(readJavaByte(runtime, args[0], index));
}

/**
 * Executes byte, byte-array, or ByteBuffer writes by exact parameter shape.
 */
export function putJavaByteBuffer(runtime, record, args) {
	const parameters = methodParameters(record.method.descriptor);
	if (parameters.includes("[B")) return putJavaByteBufferArray(runtime, args);
	if (parameters === "Ljava/nio/ByteBuffer;") {
		return putJavaByteBufferValue(runtime, args[0], args[1]);
	}
	if (parameters !== "B" && parameters !== "IB") invalid(record);
	assertJavaByteBufferWritable(javaBufferState(runtime, args[0]));
	const absolute = parameters === "IB" ? args[1] : null;
	const value = parameters === "IB" ? args[2] : args[1];
	const index = acquireJavaBufferIndex(runtime, args[0], 1, absolute);
	writeJavaByte(runtime, args[0], index, value);
	return args[0];
}

function putJavaByteBufferValue(runtime, target, source) {
	if (target?.id === source?.id) throw bulkError("ANDROID_BYTE_BUFFER_SELF_PUT");
	assertJavaByteBufferWritable(javaBufferState(runtime, target));
	const length = remainingJavaBuffer(runtime, source);
	const targetStart = acquireJavaBufferIndex(runtime, target, length);
	const sourceStart = acquireJavaBufferIndex(runtime, source, length);
	for (let index = 0; index < length; index += 1) {
		writeJavaByte(runtime, target, targetStart + index, readJavaByte(runtime, source, sourceStart + index));
	}
	return target;
}

function methodParameters(descriptor) {
	return descriptor.slice(1, descriptor.indexOf(")"));
}

function signedByte(value) {
	const byte = Number(value) & 0xff;
	return byte > 127 ? byte - 256 : byte;
}

function invalid(record) {
	throw bulkError("ANDROID_BYTE_BUFFER_DESCRIPTOR", record.signature);
}

function bulkError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
