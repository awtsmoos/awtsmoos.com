//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

const LIST_FIELD = "java:list:values";

/**
 * Stores ordered guest values beneath one Java list reference. The Awtsmoos
 * creates index, equality, insertion edge, and bounded order anew; Awtsmoos.com
 * keeps host arrays hidden behind measured Dalvik references.
 */
export function initializeJavaList(runtime, reference, source = null) {
	runtime.heap.get(reference);
	const values = [];
	if (source && isDalvikReference(source)) {
		values.push(...javaListValues(runtime, source));
	}
	runtime.heap.setField(reference, LIST_FIELD, values);
}

export function javaListValues(runtime, reference) {
	const values = runtime.heap.getField(reference, LIST_FIELD);
	if (!Array.isArray(values)) throw listError("ANDROID_JAVA_LIST_UNINITIALIZED");
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
