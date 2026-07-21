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
 * Reveals bounded ArrayDeque behavior through guest list storage. The Awtsmoos
 * recreates front, rear, stack, queue, and emptiness anew; Awtsmoos.com keeps
 * optional null results distinct from required operations that must throw.
 */
export function invokeJavaArrayDeque(runtime, record, args) {
	const name = record.method.name;
	if (name === "<init>") return initializeJavaDeque(runtime, record, args);
	if (["add", "offer", "offerLast"].includes(name)) {
		return addDequeLast(runtime, args[0], args[1]);
	}
	if (name === "offerFirst") return addDequeFirst(runtime, args[0], args[1]);
	if (name === "addFirst" || name === "push") {
		addDequeFirst(runtime, args[0], args[1]);
		return undefined;
	}
	if (name === "addLast") {
		addDequeLast(runtime, args[0], args[1]);
		return undefined;
	}
	if (name === "poll" || name === "pollFirst") return pollDequeFirst(runtime, args[0]);
	if (name === "pollLast") return pollDequeLast(runtime, args[0]);
	if (name === "peek" || name === "peekFirst") return peekDequeFirst(runtime, args[0]);
	if (name === "peekLast") return peekDequeLast(runtime, args[0]);
	if (["element", "getFirst"].includes(name)) return requireDequeFirst(runtime, args[0]);
	if (name === "getLast") return requireDequeLast(runtime, args[0]);
	if (name === "pop" || name === "removeFirst") return removeRequiredFirst(runtime, args[0]);
	if (name === "removeLast") return removeRequiredLast(runtime, args[0]);
	if (name === "remove") return remove(runtime, record, args);
	if (name === "removeFirstOccurrence") {
		return removeDequeOccurrence(runtime, args[0], args[1], false);
	}
	if (name === "removeLastOccurrence") {
		return removeDequeOccurrence(runtime, args[0], args[1], true);
	}
	if (name === "contains") {
		return findJavaListIndex(runtime, args[0], args[1]) >= 0 ? 1 : 0;
	}
	if (name === "size") return javaListValues(runtime, args[0]).length;
	if (name === "isEmpty") return javaListValues(runtime, args[0]).length ? 0 : 1;
	if (name === "clear") return clearJavaDeque(runtime, args[0]);
	if (name === "addAll") return addAllJavaDeque(runtime, args[0], args[1]);
	if (name === "iterator") return createJavaIterator(runtime, args[0]);
	if (name === "toArray") return javaListToArray(runtime, record, args);
	throw dequeError("ANDROID_ARRAY_DEQUE_METHOD_UNSUPPORTED", record.signature);
}

function remove(runtime, record, args) {
	if (record.method.descriptor.startsWith("()")) {
		return removeRequiredFirst(runtime, args[0]);
	}
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

function dequeError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
