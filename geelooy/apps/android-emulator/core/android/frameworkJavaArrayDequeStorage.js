//B"H
//Boruch Hashem
//Blessed is He

import { collectionValues } from "./frameworkJavaCollectionStorage.js";
import {
	findJavaListIndex,
	initializeJavaList,
	javaListValues
} from "./frameworkJavaListStorage.js";
import { sameGuestValue } from "./frameworkJavaValueIdentity.js";

const MAXIMUM_VALUES = 65536;

/**
 * Stores one bounded Java ArrayDeque as ordered guest list values.
 * The Awtsmoos recreates front, back, emptiness, and occurrence anew;
 * Awtsmoos.com forbids null and never delegates queue authority to the host.
 */
export function initializeArrayDeque(runtime, record, args) {
	const descriptor = record.method.descriptor;
	if (descriptor === "(I)V") validateCapacity(args[1]);
	initializeJavaList(runtime, args[0]);
	if (descriptor.includes("Ljava/util/Collection;")) {
		addDequeValues(runtime, args[0], collectionValues(runtime, args[1]));
	}
}

export function addDequeValue(runtime, reference, value, front = false) {
	if (!value) throw dequeError("ANDROID_ARRAY_DEQUE_NULL");
	const values = javaListValues(runtime, reference);
	if (values.length >= MAXIMUM_VALUES) {
		throw dequeError("ANDROID_ARRAY_DEQUE_LIMIT", MAXIMUM_VALUES);
	}
	if (front) values.unshift(value);
	else values.push(value);
	return 1;
}

export function addDequeValues(runtime, reference, source) {
	for (const value of source) addDequeValue(runtime, reference, value);
	return source.length ? 1 : 0;
}

export function pollDequeValue(runtime, reference, back = false) {
	const values = javaListValues(runtime, reference);
	return (back ? values.pop() : values.shift()) ?? 0;
}

export function peekDequeValue(runtime, reference, back = false) {
	const values = javaListValues(runtime, reference);
	return (back ? values.at(-1) : values[0]) ?? 0;
}

export function requireDequeValue(runtime, reference, back = false) {
	const value = peekDequeValue(runtime, reference, back);
	if (!value) throw dequeError("ANDROID_ARRAY_DEQUE_EMPTY");
	return value;
}

export function removeDequeOccurrence(runtime, reference, expected, last = false) {
	const values = javaListValues(runtime, reference);
	const index = last
		? findLastIndex(runtime, values, expected)
		: findJavaListIndex(runtime, reference, expected);
	if (index < 0) return 0;
	values.splice(index, 1);
	return 1;
}

export function clearArrayDeque(runtime, reference) {
	javaListValues(runtime, reference).length = 0;
}

export function arrayDequeSize(runtime, reference) {
	return javaListValues(runtime, reference).length;
}

function findLastIndex(runtime, values, expected) {
	for (let index = values.length - 1; index >= 0; index -= 1) {
		if (sameGuestValue(runtime, values[index], expected)) return index;
	}
	return -1;
}

function validateCapacity(value) {
	const capacity = Number(value);
	if (!Number.isInteger(capacity) || capacity < 0) {
		throw dequeError("ANDROID_ARRAY_DEQUE_CAPACITY", value);
	}
}

function dequeError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
