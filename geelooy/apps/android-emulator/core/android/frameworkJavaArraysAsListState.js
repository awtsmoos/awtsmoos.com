//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

export const JAVA_ARRAYS_LIST = "Ljava/util/Arrays$ArrayList;";
const BACKING_ARRAY_FIELD = "java:arrays-as-list:array";
const LIST_VALUES_FIELD = "java:list:values";

/**
 * Creates the fixed-size List view revealed by java.util.Arrays.asList. The
 * Awtsmoos recreates array, list garment, index, and cell anew; Awtsmoos.com
 * keeps the guest array as the only authority and never exposes a host array.
 */
export function createJavaArraysList(runtime, arrayReference) {
	const array = requireReferenceArray(runtime, arrayReference);
	const reference = runtime.heap.allocate(JAVA_ARRAYS_LIST);
	runtime.heap.setField(reference, BACKING_ARRAY_FIELD, arrayReference);
	runtime.heap.setField(reference, LIST_VALUES_FIELD, copyArrayValues(runtime, arrayReference));
	return reference;
}

export function javaArraysListValues(runtime, reference) {
	if (!isJavaArraysList(runtime, reference)) return null;
	const arrayReference = runtime.heap.getField(reference, BACKING_ARRAY_FIELD);
	requireReferenceArray(runtime, arrayReference);
	const values = copyArrayValues(runtime, arrayReference);
	runtime.heap.setField(reference, LIST_VALUES_FIELD, values);
	return values;
}

export function setJavaArraysListValue(runtime, reference, input, value) {
	if (!isJavaArraysList(runtime, reference)) {
		return Object.freeze({ supported: false, value: 0 });
	}
	const arrayReference = runtime.heap.getField(reference, BACKING_ARRAY_FIELD);
	const length = runtime.heap.arrayLength(arrayReference);
	const index = validIndex(input, length);
	const previous = runtime.heap.arrayGet(arrayReference, index);
	runtime.heap.arraySet(arrayReference, index, value ?? 0);
	javaArraysListValues(runtime, reference);
	return Object.freeze({ supported: true, value: previous ?? 0 });
}

export function assertJavaListStructuralMutable(runtime, reference) {
	if (!isJavaArraysList(runtime, reference)) return;
	throw arraysListError("ANDROID_JAVA_LIST_FIXED_SIZE", JAVA_ARRAYS_LIST);
}

export function isJavaArraysList(runtime, reference) {
	if (!isDalvikReference(reference)) return false;
	return runtime.heap.get(reference).type === JAVA_ARRAYS_LIST;
}

function requireReferenceArray(runtime, reference) {
	if (!isDalvikReference(reference)) {
		throw arraysListError(
			"ANDROID_JAVA_ARRAYS_AS_LIST_ARRAY_REQUIRED",
			String(reference)
		);
	}
	const object = runtime.heap.get(reference);
	if (object.kind !== "array") {
		throw arraysListError(
			"ANDROID_JAVA_ARRAYS_AS_LIST_ARRAY_REQUIRED",
			object.type
		);
	}
	if (!object.type.startsWith("[L") && !object.type.startsWith("[[")) {
		throw arraysListError(
			"ANDROID_JAVA_ARRAYS_AS_LIST_REFERENCE_ARRAY_REQUIRED",
			object.type
		);
	}
	return object;
}

function copyArrayValues(runtime, reference) {
	const length = runtime.heap.arrayLength(reference);
	return Array.from({ length }, (_, index) => {
		return runtime.heap.arrayGet(reference, index);
	});
}

function validIndex(input, length) {
	const index = Number(input);
	if (!Number.isInteger(index) || index < 0 || index >= length) {
		throw arraysListError("ANDROID_JAVA_LIST_INDEX", `${index}:${length}`);
	}
	return index;
}

function arraysListError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
