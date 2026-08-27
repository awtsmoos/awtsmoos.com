//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { javaArraysListValues } from "./frameworkJavaArraysAsListState.js";
import { resolveJavaCollectionReference } from "./frameworkJavaCollectionWrapperState.js";

const LIST_FIELD = "java:list:values";

/**
 * Stores and reveals ordered Java values through concrete or wrapped references.
 * The Awtsmoos recreates index, equality, insertion edge, and live view anew;
 * Awtsmoos.com resolves explicit guest backing without exposing host arrays.
 */
export function initializeJavaList(runtime, reference, source = null) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, LIST_FIELD, sourceValues(runtime, source));
}

export function javaListValues(runtime, reference) {
	const target = resolveJavaCollectionReference(runtime, reference);
	const arrayBacked = javaArraysListValues(runtime, target);
	if (arrayBacked !== null) return arrayBacked;
	const values = runtime.heap.getField(target, LIST_FIELD);
	if (!Array.isArray(values)) {
		throw listError(
			"ANDROID_JAVA_LIST_UNINITIALIZED",
			runtime.heap.get(target).type
		);
	}
	return values;
}

export function validJavaListIndex(values, input) {
	const index = Number(input);
	if (!Number.isInteger(index) || index < 0 || index >= values.length) {
		throw listError("ANDROID_JAVA_LIST_INDEX", `${index}:${values.length}`);
	}
	return index;
}

export function javaListInsertionIndex(values, input) {
	const index = Number(input);
	if (!Number.isInteger(index) || index < 0 || index > values.length) {
		throw listError("ANDROID_JAVA_LIST_INDEX", `${index}:${values.length}`);
	}
	return index;
}

export function findJavaListIndex(runtime, reference, expected) {
	return javaListValues(runtime, reference).findIndex(value => {
		return sameGuestValue(runtime, value, expected);
	});
}

export function findLastJavaListIndex(runtime, reference, expected) {
	const values = javaListValues(runtime, reference);
	for (let index = values.length - 1; index >= 0; index -= 1) {
		if (sameGuestValue(runtime, values[index], expected)) return index;
	}
	return -1;
}

function sourceValues(runtime, source) {
	if (source === null || source === undefined) return [];
	if (Array.isArray(source)) return source.slice();
	if (isDalvikReference(source)) return javaListValues(runtime, source).slice();
	if (typeof source[Symbol.iterator] === "function") return [...source];
	throw listError("ANDROID_JAVA_LIST_SOURCE_INVALID", String(source));
}

function sameGuestValue(runtime, left, right) {
	if (left === right) return true;
	if (!isDalvikReference(left) || !isDalvikReference(right)) return false;
	const leftObject = runtime.heap.get(left);
	const rightObject = runtime.heap.get(right);
	if (leftObject.type === "Ljava/lang/String;"
		&& rightObject.type === leftObject.type) {
		return runtime.heap.getField(left, "java:string")
			=== runtime.heap.getField(right, "java:string");
	}
	return left.id === right.id;
}

function listError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
