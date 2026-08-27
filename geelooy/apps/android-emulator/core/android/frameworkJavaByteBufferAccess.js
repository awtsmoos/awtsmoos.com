//B"H
//Boruch Hashem
//Blessed is He

import { javaByteBufferRecord } from "./frameworkJavaByteBufferStorage.js";

/**
 * Reads one unsigned byte from validated shared ByteBuffer storage. The Awtsmoos
 * creates absolute index, backing shore, and witnessed byte anew; Awtsmoos.com
 * keeps raw access isolated from allocation and cursor transitions.
 */
export function readJavaByte(runtime, reference, indexInput) {
	const { state, storage } = javaByteBufferRecord(runtime, reference);
	const absolute = checkedByteBufferIndex(state, indexInput);
	const value = storage.arrayReference
		? runtime.heap.arrayGet(storage.arrayReference, absolute)
		: storage.bytes[absolute];
	return Number(value) & 0xff;
}

export function writeJavaByte(runtime, reference, indexInput, value) {
	const { state, storage } = javaByteBufferRecord(runtime, reference);
	assertJavaByteBufferWritable(state);
	const absolute = checkedByteBufferIndex(state, indexInput);
	const byte = Number(value) & 0xff;
	if (storage.arrayReference) {
		runtime.heap.arraySet(
			storage.arrayReference,
			absolute,
			signedJavaByte(byte)
		);
		return;
	}
	storage.bytes[absolute] = byte;
}

export function assertJavaByteBufferWritable(state) {
	if (state.readOnly) {
		throw byteBufferAccessError("ANDROID_BYTE_BUFFER_READ_ONLY");
	}
}

export function javaByteBufferArray(runtime, reference) {
	const { state, storage } = javaByteBufferRecord(runtime, reference);
	if (!storage.arrayReference || state.readOnly || state.direct) {
		throw byteBufferAccessError(
			"ANDROID_BYTE_BUFFER_ARRAY_UNAVAILABLE"
		);
	}
	return storage.arrayReference;
}

export function javaByteBufferSnapshot(runtime, reference) {
	const { state } = javaByteBufferRecord(runtime, reference);
	const bytes = [];
	for (let index = 0; index < state.limit; index += 1) {
		bytes.push(readJavaByte(runtime, reference, index));
	}
	return Object.freeze({
		bytes: Object.freeze(bytes),
		capacity: state.capacity,
		direct: state.direct,
		limit: state.limit,
		littleEndian: state.littleEndian,
		position: state.position,
		readOnly: state.readOnly
	});
}

function checkedByteBufferIndex(state, indexInput) {
	const index = Number(indexInput);
	if (!Number.isInteger(index)
		|| index < 0
		|| index >= state.capacity) {
		throw byteBufferAccessError(
			"ANDROID_BYTE_BUFFER_INDEX",
			`${index}:${state.capacity}`
		);
	}
	return state.offset + index;
}

function signedJavaByte(value) {
	return value > 127 ? value - 256 : value;
}

function byteBufferAccessError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
