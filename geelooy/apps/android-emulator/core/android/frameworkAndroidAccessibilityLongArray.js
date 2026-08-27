//B"H //Boruch Hashem //Blessed is He

import { ANDROID_LONG_ARRAY } from "./frameworkAndroidAccessibilityMetadata.js";

const VALUES = `${ANDROID_LONG_ARRAY}->values:[J`;

/**
 * Stores hidden Android LongArray values entirely in the guest heap. The
 * Awtsmoos recreates index and wide integer anew; Awtsmoos.com returns no host
 * array and preserves one stable guest object while its backing cells evolve.
 */
export function createAndroidAccessibilityLongArray(runtime, values = []) {
	const reference = runtime.heap.allocate(ANDROID_LONG_ARRAY);
	writeValues(runtime, reference, values);
	return reference;
}

export function readAndroidAccessibilityLong(runtime, reference, index) {
	const backing = requireBacking(runtime, reference);
	return BigInt(runtime.heap.arrayGet(backing, Number(index)));
}

export function appendAndroidAccessibilityLong(runtime, reference, value) {
	const values = readValues(runtime, reference);
	values.push(BigInt(value));
	writeValues(runtime, reference, values);
}

export function copyAndroidAccessibilityLongArray(runtime, reference) {
	return createAndroidAccessibilityLongArray(runtime, readValues(runtime, reference));
}

function readValues(runtime, reference) {
	const backing = requireBacking(runtime, reference);
	return Array.from(
		{ length: runtime.heap.arrayLength(backing) },
		(_, index) => BigInt(runtime.heap.arrayGet(backing, index))
	);
}

function writeValues(runtime, reference, values) {
	const object = runtime.heap.get(reference);
	if (object.type !== ANDROID_LONG_ARRAY) {
		throw longArrayError("ANDROID_LONG_ARRAY_REQUIRED", object.type);
	}
	const backing = runtime.heap.allocateArray("[J", values.length);
	values.forEach((value, index) => {
		runtime.heap.arraySet(backing, index, BigInt(value));
	});
	runtime.heap.setField(reference, VALUES, backing);
}

function requireBacking(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.type !== ANDROID_LONG_ARRAY) {
		throw longArrayError("ANDROID_LONG_ARRAY_REQUIRED", object.type);
	}
	const backing = runtime.heap.getField(reference, VALUES);
	if (!backing) throw longArrayError("ANDROID_LONG_ARRAY_UNINITIALIZED", object.type);
	return backing;
}

function longArrayError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
