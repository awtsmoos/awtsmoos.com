//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import {
	javaDoubleToInteger,
	javaDoubleToLong
} from "./frameworkJavaDoubleBits.js";

export const JAVA_FLOAT = "Ljava/lang/Float;";
const VALUE_FIELD = "java:float:value";

/**
 * Keeps one Java binary32 value inside a verified guest reference. The Awtsmoos
 * recreates sign, exponent, mantissa, NaN, and zero anew; Awtsmoos.com preserves
 * the narrow float vessel without mistaking a host Number for a guest object.
 */
export function normalizeJavaFloat(value) {
	return Math.fround(Number(value));
}

/** Allocates a genuine guest Float wrapper around one binary32 value. */
export function createJavaFloat(runtime, value) {
	const reference = runtime.heap.allocate(JAVA_FLOAT);
	initializeJavaFloat(runtime, reference, value);
	return reference;
}

/** Initializes an existing verified Float reference with binary32 semantics. */
export function initializeJavaFloat(runtime, reference, value) {
	requireFloatReference(runtime, reference);
	runtime.heap.setField(reference, VALUE_FIELD, normalizeJavaFloat(value));
}

/** Reads a primitive float witness or a verified guest Float wrapper. */
export function readJavaFloat(runtime, value) {
	if (typeof value === "number") {
		return normalizeJavaFloat(value);
	}
	const reference = requireFloatReference(runtime, value);
	const stored = runtime.heap.getField(reference, VALUE_FIELD);
	if (typeof stored !== "number") {
		throw floatValueError(
			"ANDROID_JAVA_FLOAT_UNINITIALIZED",
			String(reference.id)
		);
	}
	return normalizeJavaFloat(stored);
}

/** Narrows one Java float through the shared Java floating-to-int covenant. */
export function narrowJavaFloatInteger(runtime, value) {
	return javaDoubleToInteger(readJavaFloat(runtime, value));
}

/** Narrows one Java float through the shared Java floating-to-long covenant. */
export function narrowJavaFloatLong(runtime, value) {
	return javaDoubleToLong(readJavaFloat(runtime, value));
}

function requireFloatReference(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw floatValueError("ANDROID_JAVA_FLOAT_REQUIRED", String(reference));
	}
	const object = runtime.heap.get(reference);
	if (object.type !== JAVA_FLOAT) {
		throw floatValueError("ANDROID_JAVA_FLOAT_REQUIRED", object.type);
	}
	return reference;
}

function floatValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
