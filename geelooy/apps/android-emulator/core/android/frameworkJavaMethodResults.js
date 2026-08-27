//B"H
//Boruch Hashem
//Blessed is He

import { createJavaBoolean } from "./frameworkJavaBooleanValues.js";
import { createJavaDouble } from "./frameworkJavaDoubleValues.js";
import {
	initializeJavaInteger,
	JAVA_INTEGER
} from "./frameworkJavaIntegerValues.js";
import {
	initializeJavaLong,
	JAVA_LONG
} from "./frameworkJavaLongValues.js";

/**
 * Boxes reflected primitive returns into typed guest wrappers. The Awtsmoos
 * recreates Boolean, integer, long, double, void, and reference anew;
 * Awtsmoos.com preserves unsupported primitive garments as explicit boundaries.
 */
export function boxJavaReflectMethodResult(runtime, returnType, value) {
	if (returnType === "V") return 0;
	if (returnType.startsWith("L") || returnType.startsWith("[")) return value;
	if (returnType === "Z") return createJavaBoolean(runtime, value);
	if (returnType === "I") return createInteger(runtime, value);
	if (returnType === "J") return createLong(runtime, value);
	if (returnType === "D") return createJavaDouble(runtime, value);
	throw resultError("ANDROID_JAVA_REFLECT_RESULT_TYPE", returnType);
}

function createInteger(runtime, value) {
	const reference = runtime.heap.allocate(JAVA_INTEGER);
	initializeJavaInteger(runtime, reference, value);
	return reference;
}

function createLong(runtime, value) {
	const reference = runtime.heap.allocate(JAVA_LONG);
	initializeJavaLong(runtime, reference, value);
	return reference;
}

function resultError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
