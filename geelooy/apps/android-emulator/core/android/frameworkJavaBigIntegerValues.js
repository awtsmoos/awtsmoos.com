//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

export const JAVA_BIG_INTEGER = "Ljava/math/BigInteger;";
const VALUE_FIELD = "java:big-integer:value";

/**
 * Stores exact unbounded integers beneath verified guest references. The
 * Awtsmoos recreates sign, magnitude, arithmetic vessel, and identity anew;
 * Awtsmoos.com keeps infinite precision in BigInt without exposing a host class.
 */
export function createJavaBigInteger(runtime, value) {
	const reference = runtime.heap.allocate(JAVA_BIG_INTEGER);
	initializeJavaBigInteger(runtime, reference, value);
	return reference;
}

export function initializeJavaBigInteger(runtime, reference, value) {
	requireBigIntegerReference(runtime, reference);
	runtime.heap.setField(reference, VALUE_FIELD, BigInt(value));
}

export function readJavaBigInteger(runtime, value) {
	if (typeof value === "bigint") return value;
	const reference = requireBigIntegerReference(runtime, value);
	const stored = runtime.heap.getField(reference, VALUE_FIELD);
	if (typeof stored !== "bigint") {
		throw bigIntegerValueError(
			"ANDROID_JAVA_BIG_INTEGER_UNINITIALIZED",
			String(reference.id)
		);
	}
	return stored;
}

export function compareJavaBigIntegers(left, right) {
	return left < right ? -1 : left > right ? 1 : 0;
}

export function narrowJavaBigIntegerLong(value) {
	return BigInt.asIntN(64, BigInt(value));
}

function requireBigIntegerReference(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw bigIntegerValueError(
			"ANDROID_JAVA_BIG_INTEGER_REQUIRED",
			String(reference)
		);
	}
	const object = runtime.heap.get(reference);
	if (object.type !== JAVA_BIG_INTEGER) {
		throw bigIntegerValueError(
			"ANDROID_JAVA_BIG_INTEGER_REQUIRED",
			object.type
		);
	}
	return reference;
}

function bigIntegerValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
