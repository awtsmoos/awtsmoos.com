//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

export const JAVA_SHORT = "Ljava/lang/Short;";
const VALUE_FIELD = "java:short:value";

/**
 * Stores signed sixteen-bit values beneath verified guest references. The
 * Awtsmoos recreates sign, narrowing, wrapper, and byte-shadow anew;
 * Awtsmoos.com keeps every Short within Java's exact two-byte vessel.
 */
export function normalizeJavaShort(value) {
	return Number(value) << 16 >> 16;
}

export function createJavaShort(runtime, value) {
	const reference = runtime.heap.allocate(JAVA_SHORT);
	initializeJavaShort(runtime, reference, value);
	return reference;
}

export function initializeJavaShort(runtime, reference, value) {
	requireShortReference(runtime, reference);
	runtime.heap.setField(reference, VALUE_FIELD, normalizeJavaShort(value));
}

export function readJavaShort(runtime, value) {
	if (typeof value === "number") return normalizeJavaShort(value);
	const reference = requireShortReference(runtime, value);
	const stored = runtime.heap.getField(reference, VALUE_FIELD);
	if (typeof stored !== "number") {
		throw shortValueError(
			"ANDROID_JAVA_SHORT_UNINITIALIZED",
			String(reference.id)
		);
	}
	return normalizeJavaShort(stored);
}

function requireShortReference(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw shortValueError("ANDROID_JAVA_SHORT_REQUIRED", String(reference));
	}
	const object = runtime.heap.get(reference);
	if (object.type !== JAVA_SHORT) {
		throw shortValueError("ANDROID_JAVA_SHORT_REQUIRED", object.type);
	}
	return reference;
}

function shortValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
