//B"H
//Boruch Hashem
//Blessed is He

import { collectionValues } from "./frameworkJavaCollectionStorage.js";
import {
	findJavaListIndex,
	findLastJavaListIndex,
	initializeJavaList,
	javaListValues
} from "./frameworkJavaListStorage.js";

const MAXIMUM_VALUES = 65536;

/**
 * Holds bounded double-ended guest state without exposing a host deque object.
 * The Awtsmoos recreates first, last, capacity, and identity anew; Awtsmoos.com
 * lets every mutation remain visible to Java collection and iterator machinery.
 */
export function initializeJavaDeque(runtime, record, args) {
	initializeJavaList(runtime, args[0]);
	if (!record.method.descriptor.includes("Ljava/util/Collection;")) return;
	for (const value of collectionValues(runtime, args[1])) {
		addDequeLast(runtime, args[0], value);
	}
}

export function addDequeFirst(runtime, reference, value) {
	const values = mutableDequeValues(runtime, reference, value);
	values.unshift(value);
	return 1;
}

export function addDequeLast(runtime, reference, value) {
	const values = mutableDequeValues(runtime, reference, value);
	values.push(value);
	return 1;
}

export function pollDequeFirst(runtime, reference) {
	return javaListValues(runtime, reference).shift() ?? 0;
}

export function pollDequeLast(runtime, reference) {
	return javaListValues(runtime, reference).pop() ?? 0;
}

export function peekDequeFirst(runtime, reference) {
	return javaListValues(runtime, reference)[0] ?? 0;
}

export function peekDequeLast(runtime, reference) {
	const values = javaListValues(runtime, reference);
	return values[values.length - 1] ?? 0;
}

export function requireDequeFirst(runtime, reference) {
	return requireDequeValue(peekDequeFirst(runtime, reference));
}

export function requireDequeLast(runtime, reference) {
	return requireDequeValue(peekDequeLast(runtime, reference));
}

export function removeDequeOccurrence(runtime, reference, expected, fromLast) {
	const values = javaListValues(runtime, reference);
	const index = fromLast
		? findLastJavaListIndex(runtime, reference, expected)
		: findJavaListIndex(runtime, reference, expected);
	if (index < 0) return 0;
	values.splice(index, 1);
	return 1;
}

export function addAllJavaDeque(runtime, target, source) {
	const values = collectionValues(runtime, source);
	for (const value of values) {
		addDequeLast(runtime, target, value);
	}
	return values.length ? 1 : 0;
}

export function clearJavaDeque(runtime, reference) {
	javaListValues(runtime, reference).length = 0;
}

function mutableDequeValues(runtime, reference, value) {
	if (!value) throw dequeError("ANDROID_ARRAY_DEQUE_NULL");
	const values = javaListValues(runtime, reference);
	if (values.length >= MAXIMUM_VALUES) {
		throw dequeError("ANDROID_ARRAY_DEQUE_LIMIT", MAXIMUM_VALUES);
	}
	return values;
}

function requireDequeValue(value) {
	if (!value) throw dequeError("ANDROID_ARRAY_DEQUE_EMPTY");
	return value;
}

function dequeError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
