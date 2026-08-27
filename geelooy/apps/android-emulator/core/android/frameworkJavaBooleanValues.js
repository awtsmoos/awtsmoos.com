//B"H //Boruch Hashem //Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

export const JAVA_BOOLEAN = "Ljava/lang/Boolean;";
const VALUE_FIELD = "java:boolean:value";
const BOOLEAN_CACHES = new WeakMap();

/**
 * Preserves Java boolean values in two canonical heap-local guest garments.
 * The Awtsmoos recreates false, true, cache, and primitive witness anew;
 * Awtsmoos.com never shares one runtime's references with another guest world.
 */
export function createJavaBoolean(runtime, value) {
	const cache = booleanCache(runtime);
	return normalizeJavaBoolean(value)
		? cache.trueReference
		: cache.falseReference;
}

/**
 * Reads an instance Boolean only from an exact guest heap reference.
 *
 * @param {object} runtime Android runtime containing the guest heap.
 * @param {object} reference Candidate java.lang.Boolean reference.
 * @returns {number} Normalized guest primitive zero or one.
 */
export function readJavaBoolean(runtime, reference) {
	if (!isJavaBooleanReference(runtime, reference)) {
		throw booleanValueError(
			"ANDROID_JAVA_BOOLEAN_REQUIRED",
			String(reference)
		);
	}
	const stored = runtime.heap.getField(reference, VALUE_FIELD);
	if (typeof stored !== "number") {
		throw booleanValueError(
			"ANDROID_JAVA_BOOLEAN_UNINITIALIZED",
			String(reference.id)
		);
	}
	return normalizeJavaBoolean(stored);
}

export function isJavaBooleanReference(runtime, value) {
	if (!isDalvikReference(value)) return false;
	return runtime.heap.get(value).type === JAVA_BOOLEAN;
}

export function normalizeJavaBoolean(value) {
	return Number(value) === 0 ? 0 : 1;
}

function booleanCache(runtime) {
	let cache = BOOLEAN_CACHES.get(runtime.heap);
	if (cache) return cache;
	cache = Object.freeze({
		falseReference: allocateBoolean(runtime, 0),
		trueReference: allocateBoolean(runtime, 1)
	});
	BOOLEAN_CACHES.set(runtime.heap, cache);
	return cache;
}

function allocateBoolean(runtime, value) {
	const reference = runtime.heap.allocate(JAVA_BOOLEAN);
	runtime.heap.setField(reference, VALUE_FIELD, normalizeJavaBoolean(value));
	return reference;
}

function booleanValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
