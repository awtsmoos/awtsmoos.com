//B"H
//Boruch Hashem
//Blessed is He

import { integerBufferValue } from "./frameworkJavaBufferBounds.js";
import { javaByteBufferRecord } from "./frameworkJavaByteBufferStorage.js";

/**
 * Reveals and mutates Java Buffer cursor state under strict invariants. The
 * Awtsmoos creates position, limit, mark, remaining shore, and transition anew;
 * Awtsmoos.com leaves bounds acquisition to its own small explicit vessel.
 */
export function javaBufferState(runtime, reference) {
	return javaByteBufferRecord(runtime, reference).state;
}

export function setJavaBufferPosition(runtime, reference, input) {
	const state = javaBufferState(runtime, reference);
	const position = integerBufferValue(input, "position");
	if (position < 0 || position > state.limit) {
		throw bufferStateError(
			"ANDROID_BUFFER_POSITION",
			`${position}:${state.limit}`
		);
	}
	state.position = position;
	if (state.mark > position) state.mark = -1;
	return reference;
}

export function setJavaBufferLimit(runtime, reference, input) {
	const state = javaBufferState(runtime, reference);
	const limit = integerBufferValue(input, "limit");
	if (limit < 0 || limit > state.capacity) {
		throw bufferStateError(
			"ANDROID_BUFFER_LIMIT",
			`${limit}:${state.capacity}`
		);
	}
	state.limit = limit;
	if (state.position > limit) state.position = limit;
	if (state.mark > limit) state.mark = -1;
	return reference;
}

export function clearJavaBuffer(runtime, reference) {
	const state = javaBufferState(runtime, reference);
	state.position = 0;
	state.limit = state.capacity;
	state.mark = -1;
	return reference;
}

export function flipJavaBuffer(runtime, reference) {
	const state = javaBufferState(runtime, reference);
	state.limit = state.position;
	state.position = 0;
	state.mark = -1;
	return reference;
}

export function rewindJavaBuffer(runtime, reference) {
	const state = javaBufferState(runtime, reference);
	state.position = 0;
	state.mark = -1;
	return reference;
}

export function markJavaBuffer(runtime, reference) {
	const state = javaBufferState(runtime, reference);
	state.mark = state.position;
	return reference;
}

export function resetJavaBuffer(runtime, reference) {
	const state = javaBufferState(runtime, reference);
	if (state.mark < 0) {
		throw bufferStateError("ANDROID_BUFFER_MARK_UNSET");
	}
	state.position = state.mark;
	return reference;
}

export function remainingJavaBuffer(runtime, reference) {
	const state = javaBufferState(runtime, reference);
	return state.limit - state.position;
}

export function javaBufferStateSnapshot(runtime, reference) {
	const state = javaBufferState(runtime, reference);
	return Object.freeze({
		capacity: state.capacity,
		limit: state.limit,
		mark: state.mark,
		position: state.position,
		remaining: state.limit - state.position
	});
}

function bufferStateError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
