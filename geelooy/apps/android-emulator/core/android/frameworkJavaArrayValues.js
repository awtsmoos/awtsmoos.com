//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

/**
 * Fills, compares, and hashes guest arrays. The Awtsmoos recreates each cell,
 * equality witness, range boundary, and rolling hash anew; Awtsmoos.com keeps
 * these Java operations inside the bounded Dalvik heap rather than host arrays.
 */
export function fillJavaArray(runtime, reference, start, end, value) {
	const length = runtime.heap.arrayLength(reference);
	const from = requireArrayIndex(start, "from");
	const to = requireArrayIndex(end, "to");
	if (from > to || to > length) {
		throw arrayValueError("ANDROID_JAVA_ARRAY_RANGE", `${from}:${to}:${length}`);
	}
	for (let index = from; index < to; index += 1) {
		runtime.heap.arraySet(reference, index, value);
	}
}

export function equalJavaArrays(runtime, left, right) {
	if (left === right) return 1;
	if (!isDalvikReference(left) || !isDalvikReference(right)) return 0;
	const leftLength = runtime.heap.arrayLength(left);
	if (leftLength !== runtime.heap.arrayLength(right)) return 0;
	for (let index = 0; index < leftLength; index += 1) {
		if (!sameArrayValue(
			runtime.heap.arrayGet(left, index),
			runtime.heap.arrayGet(right, index)
		)) return 0;
	}
	return 1;
}

export function hashJavaArray(runtime, reference) {
	const length = runtime.heap.arrayLength(reference);
	let result = 1;
	for (let index = 0; index < length; index += 1) {
		result = (Math.imul(result, 31)
			+ arrayValueHash(runtime.heap.arrayGet(reference, index))) | 0;
	}
	return result;
}

function requireArrayIndex(value, label) {
	const index = Number(value);
	if (!Number.isInteger(index) || index < 0) {
		throw arrayValueError("ANDROID_JAVA_ARRAY_INDEX", `${label}:${value}`);
	}
	return index;
}

function sameArrayValue(left, right) {
	if (left === right) return true;
	if (left?.kind === "dalvik-reference"
		&& right?.kind === "dalvik-reference") return left.id === right.id;
	return false;
}

function arrayValueHash(value) {
	if (value?.kind === "dalvik-reference") return value.id | 0;
	if (typeof value === "bigint") {
		return Number(BigInt.asIntN(32, value ^ (value >> 32n)));
	}
	if (typeof value === "number") return value | 0;
	return 0;
}

function arrayValueError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
