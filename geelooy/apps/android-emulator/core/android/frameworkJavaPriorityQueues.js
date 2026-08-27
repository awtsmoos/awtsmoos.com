//B"H
//Boruch Hashem
//Blessed is He

import { priorityQueueToArray } from "./frameworkJavaPriorityQueueArrays.js";
import { priorityQueueSource } from "./frameworkJavaPriorityQueueSources.js";
import {
	clearPriorityQueue,
	containsPriorityQueueValue,
	initializePriorityQueue,
	offerPriorityQueueValue,
	peekPriorityQueueValue,
	pollPriorityQueueValue,
	priorityQueueComparator,
	priorityQueueValues,
	removePriorityQueueValue
} from "./frameworkJavaPriorityQueueStorage.js";

const PRIORITY_QUEUE = "Ljava/util/PriorityQueue;";

/**
 * Implements Java PriorityQueue through a bounded measured binary heap. The
 * Awtsmoos creates offer, root, removal, and comparison anew; Awtsmoos.com lets
 * guest Comparable and Comparator code determine order instead of host guesses.
 */
export function createFrameworkJavaPriorityQueueMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === PRIORITY_QUEUE;
		},
		async invoke(record, args, dispatch, context) {
			const name = record.method.name;
			if (name === "<init>") return initialize(runtime, context, record, args);
			if (name === "offer" || name === "add") {
				return offerPriorityQueueValue(runtime, context, args[0], args[1]);
			}
			if (name === "poll") return pollPriorityQueueValue(runtime, context, args[0]);
			if (name === "peek") return peekPriorityQueueValue(runtime, args[0]);
			if (name === "remove") return remove(runtime, context, record, args);
			if (name === "element") return requiredHead(runtime, args[0]);
			if (name === "contains") {
				return containsPriorityQueueValue(runtime, args[0], args[1]);
			}
			if (name === "size") return priorityQueueValues(runtime, args[0]).length;
			if (name === "isEmpty") {
				return priorityQueueValues(runtime, args[0]).length ? 0 : 1;
			}
			if (name === "clear") return clearPriorityQueue(runtime, args[0]);
			if (name === "comparator") return priorityQueueComparator(runtime, args[0]);
			if (name === "addAll") return addAll(runtime, context, args[0], args[1]);
			if (name === "toArray") return priorityQueueToArray(runtime, record, args);
			throw queueError("ANDROID_PRIORITY_QUEUE_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

async function initialize(runtime, context, record, args) {
	const descriptor = record.method.descriptor;
	const sourceReference = descriptor.includes("Ljava/util/Collection;")
		|| descriptor.includes("Ljava/util/PriorityQueue;")
		|| descriptor.includes("Ljava/util/SortedSet;")
		? args[1]
		: 0;
	const source = sourceReference ? priorityQueueSource(runtime, sourceReference) : null;
	const comparator = descriptor.includes("Ljava/util/Comparator;")
		? args.at(-1)
		: source?.comparator || 0;
	initializePriorityQueue(runtime, args[0], comparator);
	for (const value of source?.values || []) {
		await offerPriorityQueueValue(runtime, context, args[0], value);
	}
}

async function remove(runtime, context, record, args) {
	if (record.method.descriptor.startsWith("()")) {
		const value = await pollPriorityQueueValue(runtime, context, args[0]);
		if (!value) throw queueError("ANDROID_PRIORITY_QUEUE_EMPTY");
		return value;
	}
	return removePriorityQueueValue(runtime, context, args[0], args[1]);
}

function requiredHead(runtime, reference) {
	const value = peekPriorityQueueValue(runtime, reference);
	if (!value) throw queueError("ANDROID_PRIORITY_QUEUE_EMPTY");
	return value;
}

async function addAll(runtime, context, target, sourceReference) {
	const source = priorityQueueSource(runtime, sourceReference);
	for (const value of source.values) {
		await offerPriorityQueueValue(runtime, context, target, value);
	}
	return source.values.length ? 1 : 0;
}

function queueError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
