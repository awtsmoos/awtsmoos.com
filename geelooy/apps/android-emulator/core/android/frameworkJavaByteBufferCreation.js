//B"H
//Boruch Hashem
//Blessed is He

import { createJavaByteBuffer } from "./frameworkJavaByteBufferStorage.js";

/**
 * Creates direct, heap, and wrapped Java ByteBuffers. The Awtsmoos creates
 * capacity, direct shore, guest byte array, offset, and initial cursor anew;
 * Awtsmoos.com applies one bounded creation law to arbitrary APK binary channels.
 */
export function createJavaByteBufferFromMethod(runtime, record, args) {
	const name = record.method.name;
	if (name === "allocateDirect") {
		return createJavaByteBuffer(runtime, {
			capacity: args[0],
			direct: true
		});
	}
	if (name === "allocate") {
		return createJavaByteBuffer(runtime, {
			capacity: args[0],
			direct: false
		});
	}
	if (name === "wrap") return wrapGuestByteArray(runtime, args);
	throw byteBufferCreationError(
		"ANDROID_BYTE_BUFFER_CREATION_UNSUPPORTED",
		record.signature
	);
}

function wrapGuestByteArray(runtime, args) {
	const arrayReference = args[0];
	const capacity = runtime.heap.arrayLength(arrayReference);
	const offset = args.length > 1 ? boundedInteger(args[1], "offset") : 0;
	const length = args.length > 2
		? boundedInteger(args[2], "length")
		: capacity;
	if (offset < 0 || length < 0 || offset + length > capacity) {
		throw byteBufferCreationError(
			"ANDROID_BYTE_BUFFER_WRAP_RANGE",
			`${offset}:${length}:${capacity}`
		);
	}
	return createJavaByteBuffer(runtime, {
		capacity,
		direct: false,
		limit: offset + length,
		offset: 0,
		position: offset,
		storage: { arrayReference }
	});
}

function boundedInteger(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number)) {
		throw byteBufferCreationError(
			"ANDROID_BYTE_BUFFER_CREATION_VALUE",
			`${label}:${value}`
		);
	}
	return number;
}

function byteBufferCreationError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
