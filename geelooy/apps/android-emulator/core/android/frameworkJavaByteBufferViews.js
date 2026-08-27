//B"H
//Boruch Hashem
//Blessed is He

import {
	assertJavaByteBufferWritable,
	readJavaByte,
	writeJavaByte
} from "./frameworkJavaByteBufferAccess.js";
import {
	javaBufferState,
	remainingJavaBuffer
} from "./frameworkJavaBufferState.js";
import {
	createJavaByteBuffer,
	javaByteBufferRecord
} from "./frameworkJavaByteBufferStorage.js";

/**
 * Creates shared-storage views with independent cursor state. The Awtsmoos creates
 * duplicate, slice, compacted shore, and read-only garment anew; Awtsmoos.com
 * preserves Java aliasing without copying mutable guest storage.
 */
export function duplicateJavaByteBuffer(runtime, reference) {
	const { state, storage } = javaByteBufferRecord(runtime, reference);
	const duplicate = createJavaByteBuffer(runtime, {
		capacity: state.capacity,
		direct: state.direct,
		limit: state.limit,
		littleEndian: state.littleEndian,
		offset: state.offset,
		position: state.position,
		readOnly: state.readOnly,
		storage
	});
	javaBufferState(runtime, duplicate).mark = state.mark;
	return duplicate;
}

export function readOnlyJavaByteBuffer(runtime, reference) {
	const duplicate = duplicateJavaByteBuffer(runtime, reference);
	javaBufferState(runtime, duplicate).readOnly = true;
	return duplicate;
}

export function sliceJavaByteBuffer(runtime, reference, args = []) {
	const { state, storage } = javaByteBufferRecord(runtime, reference);
	const start = args.length ? sliceValue(args[0], "start") : state.position;
	const length = args.length > 1
		? sliceValue(args[1], "length")
		: state.limit - start;
	if (start < 0 || length < 0 || start + length > state.limit) {
		throw byteBufferViewError(
			"ANDROID_BYTE_BUFFER_SLICE",
			`${start}:${length}:${state.limit}`
		);
	}
	return createJavaByteBuffer(runtime, {
		capacity: length,
		direct: state.direct,
		limit: length,
		littleEndian: state.littleEndian,
		offset: state.offset + start,
		position: 0,
		readOnly: state.readOnly,
		storage
	});
}

export function compactJavaByteBuffer(runtime, reference) {
	const state = javaBufferState(runtime, reference);
	assertJavaByteBufferWritable(state);
	const remaining = remainingJavaBuffer(runtime, reference);
	const bytes = [];
	for (let index = 0; index < remaining; index += 1) {
		bytes.push(readJavaByte(runtime, reference, state.position + index));
	}
	for (let index = 0; index < bytes.length; index += 1) {
		writeJavaByte(runtime, reference, index, bytes[index]);
	}
	state.position = remaining;
	state.limit = state.capacity;
	state.mark = -1;
	return reference;
}

export function javaByteBufferArrayOffset(runtime, reference) {
	const { state, storage } = javaByteBufferRecord(runtime, reference);
	if (!storage.arrayReference || state.readOnly || state.direct) {
		throw byteBufferViewError("ANDROID_BYTE_BUFFER_ARRAY_UNAVAILABLE");
	}
	return state.offset;
}

export function javaByteBufferHasArray(runtime, reference) {
	const { state, storage } = javaByteBufferRecord(runtime, reference);
	return storage.arrayReference && !state.readOnly && !state.direct ? 1 : 0;
}

function sliceValue(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number)) {
		throw byteBufferViewError(
			"ANDROID_BYTE_BUFFER_SLICE_VALUE",
			`${label}:${value}`
		);
	}
	return number;
}

function byteBufferViewError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
