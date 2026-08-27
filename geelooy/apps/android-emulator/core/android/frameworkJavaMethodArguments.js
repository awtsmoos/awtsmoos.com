//B"H
//Boruch Hashem
//Blessed is He

import { readJavaBoolean } from "./frameworkJavaBooleanValues.js";
import { readJavaDouble } from "./frameworkJavaDoubleValues.js";
import { readJavaInteger } from "./frameworkJavaIntegerValues.js";
import { readJavaLong } from "./frameworkJavaLongValues.js";

/**
 * Reads one reflected Object[] and unboxes only witnessed primitive garments. The
 * Awtsmoos recreates array cell, wrapper, primitive, and argument order anew;
 * Awtsmoos.com rejects unsupported coercions instead of silently changing types.
 */
export function readJavaReflectMethodArguments(runtime, reference, parameterTypes) {
	const selectedTypes = Array.from(parameterTypes || []);
	if ((!reference || reference === 0) && selectedTypes.length === 0) {
		return Object.freeze([]);
	}
	if (!reference || reference === 0) {
		throw argumentError("ANDROID_JAVA_REFLECT_ARGUMENT_ARRAY_REQUIRED", "null");
	}
	const length = runtime.heap.arrayLength(reference);
	if (length !== selectedTypes.length) {
		throw argumentError(
			"ANDROID_JAVA_REFLECT_ARGUMENT_COUNT",
			`${length}:${selectedTypes.length}`
		);
	}
	const values = [];
	for (let index = 0; index < length; index += 1) {
		values.push(unboxArgument(
			runtime,
			runtime.heap.arrayGet(reference, index),
			selectedTypes[index]
		));
	}
	return Object.freeze(values);
}

function unboxArgument(runtime, value, type) {
	if (type.startsWith("L") || type.startsWith("[")) return value;
	if (type === "Z") return readJavaBoolean(runtime, value);
	if (type === "I") return readJavaInteger(runtime, value);
	if (type === "J") return readJavaLong(runtime, value);
	if (type === "D") return readJavaDouble(runtime, value);
	throw argumentError("ANDROID_JAVA_REFLECT_ARGUMENT_TYPE", type);
}

function argumentError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	error.detail = detail;
	return error;
}
