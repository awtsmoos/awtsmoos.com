//B"H
//Boruch Hashem
//Blessed is He

import { requireClassDescriptor } from "./frameworkJavaClassValues.js";

/**
 * Allocates independent guest array copies. The Awtsmoos recreates descriptor,
 * source window, target length, and zero extension anew; Awtsmoos.com follows
 * Java copy contracts while the bounded heap remains the only memory vessel.
 */
export function copyJavaArray(runtime, source, length, classValue = null) {
	const sourceObject = requireJavaArray(runtime, source);
	const targetLength = requireArrayLength(length);
	const targetType = classValue
		? requireArrayClassDescriptor(classValue)
		: sourceObject.type;
	return copyRange(runtime, source, 0, targetLength, targetType);
}

export function copyJavaArrayRange(
	runtime,
	source,
	from,
	to,
	classValue = null
) {
	const sourceObject = requireJavaArray(runtime, source);
	const start = requireArrayIndex(from, "from");
	const end = requireArrayIndex(to, "to");
	if (start > end) {
		throw arrayCopyError("ANDROID_JAVA_ARRAY_RANGE", `${start}:${end}`);
	}
	if (start > runtime.heap.arrayLength(source)) {
		throw arrayCopyError("ANDROID_JAVA_ARRAY_INDEX", String(start));
	}
	const targetType = classValue
		? requireArrayClassDescriptor(classValue)
		: sourceObject.type;
	return copyRange(runtime, source, start, end - start, targetType);
}

function copyRange(runtime, source, start, length, targetType) {
	const target = runtime.heap.allocateArray(targetType, length);
	const available = Math.max(0, runtime.heap.arrayLength(source) - start);
	const copiedLength = Math.min(length, available);
	for (let index = 0; index < copiedLength; index += 1) {
		runtime.heap.arraySet(
			target,
			index,
			runtime.heap.arrayGet(source, start + index)
		);
	}
	return target;
}

function requireJavaArray(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.kind !== "array") {
		throw arrayCopyError("ANDROID_JAVA_ARRAY_REQUIRED", object.type);
	}
	return object;
}

function requireArrayClassDescriptor(classValue) {
	const descriptor = requireClassDescriptor(classValue);
	if (!descriptor.startsWith("[")) {
		throw arrayCopyError("ANDROID_JAVA_ARRAY_CLASS_REQUIRED", descriptor);
	}
	return descriptor;
}

function requireArrayLength(value) {
	const length = Number(value);
	if (!Number.isInteger(length) || length < 0) {
		throw arrayCopyError("ANDROID_JAVA_ARRAY_LENGTH", String(value));
	}
	return length;
}

function requireArrayIndex(value, label) {
	const index = Number(value);
	if (!Number.isInteger(index) || index < 0) {
		throw arrayCopyError("ANDROID_JAVA_ARRAY_INDEX", `${label}:${value}`);
	}
	return index;
}

function arrayCopyError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
