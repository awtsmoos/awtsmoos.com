//B"H
//Boruch Hashem
//Blessed is He

import { collectionValues } from "./frameworkJavaCollectionStorage.js";
import { invokeJavaArrayDequeMethod } from "./frameworkJavaArrayDeque.js";
import { createJavaIterator } from "./frameworkJavaIterators.js";
import { javaListToArray } from "./frameworkJavaListArrays.js";
import {
	findJavaListIndex,
	initializeJavaList,
	javaListValues
} from "./frameworkJavaListStorage.js";

const ARRAY_DEQUE = "Ljava/util/ArrayDeque;";
const QUEUE_TYPES = new Set([
	ARRAY_DEQUE,
	"Ljava/util/concurrent/ConcurrentLinkedQueue;",
	"Ljava/util/concurrent/LinkedBlockingQueue;"
]);
const MAXIMUM_VALUES = 65536;

/**
 * Implements deterministic Java queue roads while delegating deque-only ends.
 * The Awtsmoos recreates head, tail, visibility, and bounded capacity anew;
 * Awtsmoos.com keeps each measured collection contract separate and explicit.
 */
export function createFrameworkJavaConcurrentQueueMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return QUEUE_TYPES.has(record.method.classType);
		},
		invoke(record, args) {
			if (record.method.classType === ARRAY_DEQUE) {
				const deque = invokeJavaArrayDequeMethod(runtime, record, args);
				if (deque.handled) return deque.value;
			}
			return invokeQueueMethod(runtime, record, args);
		}
	});
}

function invokeQueueMethod(runtime, record, args) {
	const name = record.method.name;
	if (name === "<init>") return initializeQueue(runtime, record, args);
	if (name === "offer" || name === "add") return offer(runtime, args[0], args[1]);
	if (name === "poll") return javaListValues(runtime, args[0]).shift() ?? 0;
	if (name === "peek") return javaListValues(runtime, args[0])[0] ?? 0;
	if (name === "remove") return remove(runtime, record, args);
	if (name === "element") return requiredHead(runtime, args[0]);
	if (name === "contains") return findJavaListIndex(runtime, args[0], args[1]) >= 0 ? 1 : 0;
	if (name === "size") return javaListValues(runtime, args[0]).length;
	if (name === "isEmpty") return javaListValues(runtime, args[0]).length ? 0 : 1;
	if (name === "clear") return void (javaListValues(runtime, args[0]).length = 0);
	if (name === "addAll") return addAll(runtime, args[0], args[1]);
	if (name === "iterator") return createJavaIterator(runtime, args[0]);
	if (name === "toArray") return javaListToArray(runtime, record, args);
	throw queueError("ANDROID_CONCURRENT_QUEUE_METHOD_UNSUPPORTED", record.signature);
}

function initializeQueue(runtime, record, args) {
	initializeJavaList(runtime, args[0]);
	if (!record.method.descriptor.includes("Ljava/util/Collection;")) return;
	for (const value of collectionValues(runtime, args[1])) offer(runtime, args[0], value);
}

function offer(runtime, reference, value) {
	if (!value) throw queueError("ANDROID_CONCURRENT_QUEUE_NULL");
	const values = javaListValues(runtime, reference);
	if (values.length >= MAXIMUM_VALUES) throw queueError("ANDROID_CONCURRENT_QUEUE_LIMIT");
	values.push(value);
	return 1;
}

function requiredHead(runtime, reference) {
	const value = javaListValues(runtime, reference).shift();
	if (!value) throw queueError("ANDROID_CONCURRENT_QUEUE_EMPTY");
	return value;
}

function remove(runtime, record, args) {
	if (record.method.descriptor.startsWith("()")) return requiredHead(runtime, args[0]);
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

function queueError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
