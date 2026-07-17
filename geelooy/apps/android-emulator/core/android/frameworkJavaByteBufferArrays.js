//B"H
//Boruch Hashem
//Blessed is He

import { acquireJavaBufferIndex } from "./frameworkJavaBufferBounds.js";
import {
	assertJavaByteBufferWritable,
	readJavaByte,
	writeJavaByte
} from "./frameworkJavaByteBufferAccess.js";
import { javaBufferState } from "./frameworkJavaBufferState.js";

/**
 * Copies relative buffer bytes into a guest byte array. The Awtsmoos creates
 * target offset, length, validated region, and advanced cursor anew; Awtsmoos.com
 * moves data only through bounded guest heap and buffer roads.
 */
export function getJavaByteBufferArray(runtime, args) {
	const target = args[1];
	const offset = args.length > 2
		? boundedArrayOffset(runtime, target, args[2])
		: 0;
	const length = args.length > 3
		? boundedArrayLength(runtime, target, offset, args[3])
		: runtime.heap.arrayLength(target);
	const start = acquireJavaBufferIndex(runtime, args[0], length);
	for (let index = 0; index < length; index += 1) {
		runtime.heap.arraySet(
			target,
			offset + index,
			signedByte(readJavaByte(runtime, args[0], start + index))
		);
	}
	return args[0];
}

/**
 * Copies guest byte-array values into a writable relative buffer region.
 */
export function putJavaByteBufferArray(runtime, args) {
	const state = javaBufferState(runtime, args[0]);
	assertJavaByteBufferWritable(state);
	const source = args[1];
	const offset = args.length > 2
		? boundedArrayOffset(runtime, source, args[2])
		: 0;
	const length = args.length > 3
		? boundedArrayLength(runtime, source, offset, args[3])
		: runtime.heap.arrayLength(source);
	const start = acquireJavaBufferIndex(runtime, args[0], length);
	for (let index = 0; index < length; index += 1) {
		writeJavaByte(
			runtime,
			args[0],
			start + index,
			runtime.heap.arrayGet(source, offset + index)
		);
	}
	return args[0];
}

function boundedArrayOffset(runtime, reference, value) {
	const offset = Number(value);
	const length = runtime.heap.arrayLength(reference);
	if (!Number.isInteger(offset) || offset < 0 || offset > length) {
		throw byteBufferArrayError(
			"ANDROID_BYTE_BUFFER_ARRAY_OFFSET",
			`${offset}:${length}`
		);
	}
	return offset;
}

function boundedArrayLength(runtime, reference, offset, value) {
	const requested = Number(value);
	const available = runtime.heap.arrayLength(reference) - offset;
	if (!Number.isInteger(requested)
		|| requested < 0
		|| requested > available) {
		throw byteBufferArrayError(
			"ANDROID_BYTE_BUFFER_ARRAY_LENGTH",
			`${requested}:${available}`
		);
	}
	return requested;
}

function signedByte(value) {
	const byte = Number(value) & 0xff;
	return byte > 127 ? byte - 256 : byte;
}

function byteBufferArrayError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
