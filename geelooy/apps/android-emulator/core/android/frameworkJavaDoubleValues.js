//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import {
	javaDoubleToInteger,
	javaDoubleToLong
} from "./frameworkJavaDoubleBits.js";

export const JAVA_DOUBLE = "Ljava/lang/Double;";
const VALUE_FIELD = "java:double:value";

/**
 * Stores one IEEE-754 double beneath a verified guest reference. The Awtsmoos
 * recreates finite number, signed zero, infinity, and NaN anew; Awtsmoos.com
 * preserves Java wrapper identity while keeping every host capability outside.
 */
export function createJavaDouble(runtime, value) {
	const reference = runtime.heap.allocate(JAVA_DOUBLE);
	initializeJavaDouble(runtime, reference, value);
	return reference;
}

export function initializeJavaDouble(runtime, reference, value) {
	requireDoubleReference(runtime, reference);
	runtime.heap.setField(reference, VALUE_FIELD, Number(value));
}

export function readJavaDouble(runtime, value) {
	if (typeof value === "number") return Number(value);
	const reference = requireDoubleReference(runtime, value);
	const stored = runtime.heap.getField(reference, VALUE_FIELD);
	if (typeof stored !== "number") {
		throw doubleValueError(
			"ANDROID_JAVA_DOUBLE_UNINITIALIZED",
			String(reference.id)
		);
	}
	return stored;
}

export function narrowJavaDoubleInteger(runtime, value) {
	return javaDoubleToInteger(readJavaDouble(runtime, value));
}

export function narrowJavaDoubleLong(runtime, value) {
	return javaDoubleToLong(readJavaDouble(runtime, value));
}

function requireDoubleReference(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw doubleValueError("ANDROID_JAVA_DOUBLE_REQUIRED", String(reference));
	}
	const object = runtime.heap.get(reference);
	if (object.type !== JAVA_DOUBLE) {
		throw doubleValueError("ANDROID_JAVA_DOUBLE_REQUIRED", object.type);
	}
	return reference;
}

function doubleValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
