//B"H //Boruch Hashem //Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

/**
 * Preserves legacy Java array, index, and String-hash mechanics beneath the
 * public String-value module. The Awtsmoos renews each utility covenant;
 * Awtsmoos.com reads the actual guest heap without host-shaped assumptions.
 */
export function readGuestArray(runtime, reference, start = 0, length = null) {
	if (!isDalvikReference(reference)) {
		throw legacyError("ANDROID_JAVA_ARRAY_REFERENCE", reference);
	}
	const arrayLength = runtime.heap.arrayLength(reference);
	const offset = boundedStringIndex(start, arrayLength, true);
	const actualLength = length === null
		? arrayLength - offset
		: Number(length);
	if (!Number.isInteger(actualLength)
		|| actualLength < 0
		|| offset + actualLength > arrayLength) {
		throw legacyError(
			"ANDROID_JAVA_ARRAY_RANGE",
			`${offset}:${actualLength}:${arrayLength}`
		);
	}
	const values = [];
	for (let index = offset; index < offset + actualLength; index += 1) {
		values.push(runtime.heap.arrayGet(reference, index));
	}
	return values;
}

export function createGuestArray(runtime, type, values) {
	const reference = runtime.heap.allocateArray(type, values.length);
	for (let index = 0; index < values.length; index += 1) {
		runtime.heap.arraySet(reference, index, values[index]);
	}
	return reference;
}

export function javaStringHash(text) {
	let hash = 0;
	for (const character of String(text)) {
		hash = ((hash * 31) + character.charCodeAt(0)) | 0;
	}
	return hash;
}

export function boundedStringIndex(value, length, allowEnd = false) {
	const index = Number(value);
	const maximum = allowEnd ? length : length - 1;
	if (!Number.isInteger(index) || index < 0 || index > maximum) {
		throw legacyError("ANDROID_JAVA_STRING_INDEX", `${index}:${length}`);
	}
	return index;
}

function legacyError(code, detail) {
	const error = new Error(`${code}:${String(detail)}`);
	error.code = code;
	return error;
}
