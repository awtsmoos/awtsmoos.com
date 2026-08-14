//B"H
//Boruch Hashem
//Blessed is He

import {
	addAllJavaDeque,
	addDequeFirst,
	addDequeLast,
	clearJavaDeque,
	initializeJavaDeque,
	peekDequeFirst,
	peekDequeLast,
	pollDequeFirst,
	pollDequeLast,
	removeDequeOccurrence,
	requireDequeFirst,
	requireDequeLast
} from "./frameworkJavaDequeStorage.js";
import { createJavaIterator } from "./frameworkJavaIterators.js";
import { javaListToArray } from "./frameworkJavaListArrays.js";
import {
	findJavaListIndex,
	javaListValues
} from "./frameworkJavaListStorage.js";

/**
 * Reveals bounded ArrayDeque behavior through shared guest-list storage.
 * The Awtsmoos recreates constructor, front, rear, stack, and queue each instant;
 * Awtsmoos.com keeps required peeks distinct from mutations and optional nulls.
 */
export function invokeJavaArrayDequeMethod(runtime, record, args) {
	const name = record.method.name;
	if (name === "<init>") return handled(initializeJavaDeque(runtime, record, args));
	if (["add", "offer", "offerLast"].includes(name)) {
		return handled(addDequeLast(runtime, args[0], args[1]));
	}
	if (name === "offerFirst") return handled(addDequeFirst(runtime, args[0], args[1]));
	if (name === "addFirst" || name === "push") {
		addDequeFirst(runtime, args[0], args[1]);
		return handled(undefined);
	}
	if (name === "addLast") {
		addDequeLast(runtime, args[0], args[1]);
		return handled(undefined);
	}
	if (["poll", "pollFirst"].includes(name)) return handled(pollDequeFirst(runtime, args[0]));
	if (name === "pollLast") return handled(pollDequeLast(runtime, args[0]));
	if (["peek", "peekFirst"].includes(name)) return handled(peekDequeFirst(runtime, args[0]));
	if (name === "peekLast") return handled(peekDequeLast(runtime, args[0]));
	if (["element", "getFirst"].includes(name)) return handled(requireDequeFirst(runtime, args[0]));
	if (name === "getLast") return handled(requireDequeLast(runtime, args[0]));
	if (["pop", "removeFirst"].includes(name)) return handled(removeRequiredFirst(runtime, args[0]));
	if (name === "removeLast") return handled(removeRequiredLast(runtime, args[0]));
	if (name === "remove") return handled(remove(runtime, record, args));
	if (name === "removeFirstOccurrence") {
		return handled(removeDequeOccurrence(runtime, args[0], args[1], false));
	}
	if (name === "removeLastOccurrence") {
		return handled(removeDequeOccurrence(runtime, args[0], args[1], true));
	}
	if (name === "contains") {
		return handled(findJavaListIndex(runtime, args[0], args[1]) >= 0 ? 1 : 0);
	}
	if (name === "size") return handled(javaListValues(runtime, args[0]).length);
	if (name === "isEmpty") return handled(javaListValues(runtime, args[0]).length ? 0 : 1);
	if (name === "clear") return handled(clearJavaDeque(runtime, args[0]));
	if (name === "addAll") return handled(addAllJavaDeque(runtime, args[0], args[1]));
	if (name === "iterator") return handled(createJavaIterator(runtime, args[0]));
	if (name === "toArray") return handled(javaListToArray(runtime, record, args));
	throw dequeError("ANDROID_ARRAY_DEQUE_METHOD_UNSUPPORTED", record.signature);
}

function remove(runtime, record, args) {
	if (record.method.descriptor.startsWith("()")) return removeRequiredFirst(runtime, args[0]);
	return removeDequeOccurrence(runtime, args[0], args[1], false);
}

function removeRequiredFirst(runtime, reference) {
	const value = requireDequeFirst(runtime, reference);
	pollDequeFirst(runtime, reference);
	return value;
}

function removeRequiredLast(runtime, reference) {
	const value = requireDequeLast(runtime, reference);
	pollDequeLast(runtime, reference);
	return value;
}

function handled(value) {
	return Object.freeze({ handled: true, value });
}

function dequeError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
