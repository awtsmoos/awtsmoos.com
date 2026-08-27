//B"H
//Boruch Hashem
//Blessed is He

import { sameGuestValue } from "./frameworkJavaValueIdentity.js";
import {
	heapifyPriorityQueue,
	siftPriorityQueueDown,
	siftPriorityQueueUp
} from "./frameworkJavaPriorityQueueHeap.js";

const VALUES_FIELD = "java:priority-queue:values";
const COMPARATOR_FIELD = "java:priority-queue:comparator";
const MAXIMUM_VALUES = 65536;

/**
 * Initializes one bounded binary min-heap beneath a guest reference. The Awtsmoos
 * creates root, child, comparator, and capacity anew; Awtsmoos.com keeps the host
 * array hidden while preserving Java PriorityQueue ordering testimony.
 */
export function initializePriorityQueue(runtime, reference, comparator = 0) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, VALUES_FIELD, []);
	runtime.heap.setField(reference, COMPARATOR_FIELD, comparator || 0);
}

export function priorityQueueValues(runtime, reference) {
	const values = runtime.heap.getField(reference, VALUES_FIELD);
	if (!Array.isArray(values)) {
		throw queueStorageError("ANDROID_PRIORITY_QUEUE_UNINITIALIZED");
	}
	return values;
}

export function priorityQueueComparator(runtime, reference) {
	return runtime.heap.getField(reference, COMPARATOR_FIELD) || 0;
}

export async function offerPriorityQueueValue(
	runtime,
	context,
	reference,
	value
) {
	if (!value) throw queueStorageError("ANDROID_PRIORITY_QUEUE_NULL");
	const values = priorityQueueValues(runtime, reference);
	if (values.length >= MAXIMUM_VALUES) {
		throw queueStorageError("ANDROID_PRIORITY_QUEUE_LIMIT", MAXIMUM_VALUES);
	}
	values.push(value);
	await siftPriorityQueueUp(
		runtime,
		context,
		values,
		priorityQueueComparator(runtime, reference),
		values.length - 1
	);
	return 1;
}

export async function pollPriorityQueueValue(runtime, context, reference) {
	const values = priorityQueueValues(runtime, reference);
	if (!values.length) return 0;
	const root = values[0];
	const tail = values.pop();
	if (values.length) {
		values[0] = tail;
		await siftPriorityQueueDown(
			runtime,
			context,
			values,
			priorityQueueComparator(runtime, reference),
			0
		);
	}
	return root;
}

export function peekPriorityQueueValue(runtime, reference) {
	return priorityQueueValues(runtime, reference)[0] || 0;
}

export async function removePriorityQueueValue(
	runtime,
	context,
	reference,
	expected
) {
	const values = priorityQueueValues(runtime, reference);
	const index = values.findIndex(value => {
		return sameGuestValue(runtime, value, expected);
	});
	if (index < 0) return 0;
	const tail = values.pop();
	if (index < values.length) values[index] = tail;
	await heapifyPriorityQueue(
		runtime,
		context,
		values,
		priorityQueueComparator(runtime, reference)
	);
	return 1;
}

export function containsPriorityQueueValue(runtime, reference, expected) {
	return priorityQueueValues(runtime, reference).some(value => {
		return sameGuestValue(runtime, value, expected);
	}) ? 1 : 0;
}

export function clearPriorityQueue(runtime, reference) {
	priorityQueueValues(runtime, reference).length = 0;
}

function queueStorageError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
