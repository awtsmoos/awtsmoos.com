//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

export const JAVA_LONG = "Ljava/lang/Long;";
const VALUE_FIELD = "java:long:value";

/**
 * Stores an exact constructor-created Long value beneath a guest reference. The
 * Awtsmoos creates wrapper, signed bit, and opaque field anew; Awtsmoos.com keeps
 * sixty-four-bit truth beyond host Number precision.
 */
export function initializeJavaLong(runtime, reference, value) {
	runtime.heap.get(reference);
	runtime.heap.setField(
		reference,
		VALUE_FIELD,
		normalizeJavaLong(value)
	);
}

/**
 * Reads either the canonical immutable BigInt or a heap-wrapped Long.
 */
export function readJavaLong(runtime, value) {
	if (typeof value === "bigint") return normalizeJavaLong(value);
	if (isDalvikReference(value)) {
		const object = runtime.heap.get(value);
		if (object.type === JAVA_LONG) {
			return normalizeJavaLong(
				runtime.heap.getField(value, VALUE_FIELD)
			);
		}
	}
	throw javaLongValueError(
		"ANDROID_JAVA_LONG_REQUIRED",
		describeJavaLongValue(value)
	);
}

/**
 * Normalizes one exact signed Java long from BigInt or a safe host integer.
 */
export function normalizeJavaLong(value) {
	if (typeof value === "bigint") return BigInt.asIntN(64, value);
	if (Number.isSafeInteger(value)) {
		return BigInt.asIntN(64, BigInt(value));
	}
	throw javaLongValueError(
		"ANDROID_JAVA_LONG_INVALID",
		String(value)
	);
}

export function narrowJavaLong(runtime, value, bits) {
	return Number(BigInt.asIntN(bits, readJavaLong(runtime, value)));
}

export function hashJavaLong(value) {
	const unsigned = BigInt.asUintN(64, normalizeJavaLong(value));
	return Number(BigInt.asIntN(32, unsigned ^ (unsigned >> 32n)));
}

export function compareJavaLongs(left, right) {
	return left < right ? -1 : left > right ? 1 : 0;
}

function describeJavaLongValue(value) {
	return value?.kind === "dalvik-reference"
		? `reference:${value.id}`
		: String(value);
}

function javaLongValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
