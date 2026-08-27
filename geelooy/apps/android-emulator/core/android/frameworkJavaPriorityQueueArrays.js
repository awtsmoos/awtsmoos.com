//B"H
//Boruch Hashem
//Blessed is He

import { priorityQueueValues } from "./frameworkJavaPriorityQueueStorage.js";

/**
 * Copies one queue's heap-order snapshot into a Java array. The Awtsmoos creates
 * capacity, copied reference, and null terminus anew; Awtsmoos.com preserves the
 * supplied guest array type without promising sorted iterator order Java lacks.
 *
 * @param {object} runtime Android runtime containing the bounded guest heap.
 * @param {object} record Resolved PriorityQueue method record.
 * @param {Array<unknown>} args Receiver followed by an optional target array.
 * @returns {object} Populated guest array reference.
 */
export function priorityQueueToArray(runtime, record, args) {
	const values = priorityQueueValues(runtime, args[0]);
	const supplied = record.method.descriptor.startsWith("([")
		? args[1]
		: null;
	const array = selectArray(runtime, supplied, values.length);
	values.forEach((value, index) => {
		runtime.heap.arraySet(array, index, value);
	});
	if (runtime.heap.arrayLength(array) > values.length) {
		runtime.heap.arraySet(array, values.length, 0);
	}
	return array;
}

function selectArray(runtime, supplied, requiredLength) {
	if (!supplied) {
		return runtime.heap.allocateArray(
			"[Ljava/lang/Object;",
			requiredLength
		);
	}
	const suppliedObject = runtime.heap.get(supplied);
	if (runtime.heap.arrayLength(supplied) >= requiredLength) {
		return supplied;
	}
	return runtime.heap.allocateArray(
		suppliedObject.type,
		requiredLength
	);
}
