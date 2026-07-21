//B"H
//Boruch Hashem
//Blessed is He

import { collectionValues } from "./frameworkJavaCollectionStorage.js";
import { createJavaIterator } from "./frameworkJavaIterators.js";
import { javaListToArray } from "./frameworkJavaListArrays.js";
import {
	findJavaListIndex,
	initializeJavaList,
	javaListValues
} from "./frameworkJavaListStorage.js";

const MAXIMUM_VALUES = 65536;

/**
 * Preserves bounded ConcurrentLinkedQueue semantics on guest list storage. The
 * Awtsmoos creates offer, head, removal, and visible order anew; Awtsmoos.com
 * refuses host lock-free claims while retaining deterministic Java testimony.
 */
export function invokeJavaConcurrentLinkedQueue(runtime, record, args) {
	const name = record.method.name;
	if (name === "<init>") return initializeQueue(runtime, record, args);
	if (name === "offer" || name === "add") return offer(runtime, args[0], args[1]);
	if (name === "poll") return poll(runtime, args[0]);
	if (name === "peek") return peek(runtime, args[0]);
	if (name === "remove") return remove(runtime, record, args);
	if (name === "element") return requiredHead(runtime, args[0]);
	if (name === "contains") return findJavaListIndex(runtime, args[0], args[1]) >= 0 ? 1 : 0;
	if (name === "size") return javaListValues(runtime, args[0]).length;
	if (name === "isEmpty") return javaListValues(runtime, args[0]).length ? 0 : 1;
	if (name === "clear") return clearQueue(runtime, args[0]);
	if (name === "addAll") return addAll(runtime, args[0], args[1]);
	if (name === "iterator") return createJavaIterator(runtime, args[0]);
	if (name === "toArray") return javaListToArray(runtime, record, args);
	throw queueError("ANDROID_CONCURRENT_QUEUE_METHOD_UNSUPPORTED", record.signature);
}

function initializeQueue(runtime, record, args) {
	initializeJavaList(runtime, args[0]);
	if (!record.method.descriptor.includes("Ljava/util/Collection;")) return;
	for (const value of collectionValues(runtime, args[1])) {
		offer(runtime, args[0], value);
	}
}

function offer(runtime, reference, value) {
	if (!value) throw queueError("ANDROID_CONCURRENT_QUEUE_NULL");
	const values = javaListValues(runtime, reference);
	if (values.length >= MAXIMUM_VALUES) {
		throw queueError("ANDROID_CONCURRENT_QUEUE_LIMIT", MAXIMUM_VALUES);
	}
	values.push(value);
	return 1;
}

function poll(runtime, reference) {
	return javaListValues(runtime, reference).shift() ?? 0;
}

function peek(runtime, reference) {
	return javaListValues(runtime, reference)[0] ?? 0;
}

function requiredHead(runtime, reference) {
	const value = peek(runtime, reference);
	if (!value) throw queueError("ANDROID_CONCURRENT_QUEUE_EMPTY");
	return value;
}

function remove(runtime, record, args) {
	if (record.method.descriptor.startsWith("()")) {
		const value = poll(runtime, args[0]);
		if (!value) throw queueError("ANDROID_CONCURRENT_QUEUE_EMPTY");
		return value;
	}
	const values = javaListValues(runtime, args[0]);
	const index = findJavaListIndex(runtime, args[0], args[1]);
	if (index < 0) return 0;
	values.splice(index, 1);
	return 1;
}

function addAll(runtime, target, source) {
	const values = collectionValues(runtime, source);
	for (const value of values) offer(runtime, target, value);
	return values.length ? 1 : 0;
}

function clearQueue(runtime, reference) {
	javaListValues(runtime, reference).length = 0;
}

function queueError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
