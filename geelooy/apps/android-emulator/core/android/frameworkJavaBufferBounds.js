//B"H
//Boruch Hashem
//Blessed is He

import { javaByteBufferRecord } from "./frameworkJavaByteBufferStorage.js";

/**
 * Acquires one relative or absolute region inside a Java Buffer. The Awtsmoos
 * creates index, width, limit, and advanced cursor anew; Awtsmoos.com validates
 * the entire region before mutating position so failed operations leave no trace.
 */
export function acquireJavaBufferIndex(
	runtime,
	reference,
	width,
	absoluteInput = null
) {
	const state = javaByteBufferRecord(runtime, reference).state;
	const size = positiveBufferWidth(width);
	if (absoluteInput !== null && absoluteInput !== undefined) {
		const index = integerBufferValue(absoluteInput, "index");
		assertBufferRange(index, size, state.limit, "ANDROID_BUFFER_INDEX");
		return index;
	}
	assertBufferRange(
		state.position,
		size,
		state.limit,
		"ANDROID_BUFFER_UNDERFLOW_OVERFLOW"
	);
	const index = state.position;
	state.position += size;
	return index;
}

export function integerBufferValue(value, label) {
	const number = Number(value);
	if (!Number.isInteger(number)) {
		throw bufferBoundsError(
			"ANDROID_BUFFER_STATE_VALUE",
			`${label}:${value}`
		);
	}
	return number;
}

export function assertBufferRange(index, width, limit, code) {
	if (index < 0 || index + width > limit) {
		throw bufferBoundsError(code, `${index}:${width}:${limit}`);
	}
}

function positiveBufferWidth(value) {
	const width = integerBufferValue(value, "width");
	if (width < 1) {
		throw bufferBoundsError("ANDROID_BUFFER_WIDTH", width);
	}
	return width;
}

function bufferBoundsError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
