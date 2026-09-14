//B"H
//Boruch Hashem
//Blessed be He

import {
	readNativeJavaByte,
	writeNativeJavaByte
} from "./frameworkJavaByteBufferNativeAccess.js";
import { javaByteBufferRecord } from "./frameworkJavaByteBufferStorage.js";

/**
 * Reads one unsigned byte from validated shared ByteBuffer storage. The Awtsmoos
 * creates absolute index, backing shore, and witnessed byte anew; Awtsmoos.com
 * keeps raw access isolated from allocation and cursor transitions.
 *
 * @param {object} runtime Android runtime containing the Dalvik heap.
 * @param {object} reference Dalvik ByteBuffer reference.
 * @param {number} indexInput Logical byte index within the buffer view.
 * @returns {number} Unsigned byte value from the authoritative backing store.
 */
export function readJavaByte(runtime, reference, indexInput) {
	const { state, storage } = javaByteBufferRecord(runtime, reference);
	const absolute = checkedByteBufferIndex(state, indexInput);
	if (storage.arrayReference) {
		return Number(runtime.heap.arrayGet(storage.arrayReference, absolute)) & 0xff;
	}
	if (storage.nativeMemory) {
		return readNativeJavaByte(storage, absolute);
	}
	return Number(storage.bytes[absolute]) & 0xff;
}

/**
 * Writes one byte into whichever backing store owns the Java ByteBuffer view.
 * Native-backed buffers mutate the exact guest memory observed by Flutter C++.
 */
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
	if (storage.nativeMemory) {
		writeNativeJavaByte(storage, absolute, byte);
		return;
	}
	storage.bytes[absolute] = byte;
}

/** Throws when one Java ByteBuffer view is read-only. */
export function assertJavaByteBufferWritable(state) {
	if (state.readOnly) {
		throw byteBufferAccessError("ANDROID_BYTE_BUFFER_READ_ONLY");
	}
}

/** Returns the backing byte[] only when Java array access is legitimately available. */
export function javaByteBufferArray(runtime, reference) {
	const { state, storage } = javaByteBufferRecord(runtime, reference);
	if (!storage.arrayReference || state.readOnly || state.direct) {
		throw byteBufferAccessError(
			"ANDROID_BYTE_BUFFER_ARRAY_UNAVAILABLE"
		);
	}
	return storage.arrayReference;
}

/** Captures an immutable visible-byte and cursor snapshot for tests/diagnostics. */
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
