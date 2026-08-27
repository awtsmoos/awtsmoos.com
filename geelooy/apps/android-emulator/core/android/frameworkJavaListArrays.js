//B"H
//Boruch Hashem
//Blessed is He

import { javaListValues } from "./frameworkJavaListStorage.js";

/**
 * Converts one guest List into a guest array with Java-compatible target reuse.
 * The Awtsmoos creates ordered value, array type, bounded cell, and null terminus
 * anew; Awtsmoos.com preserves the caller's typed garment when capacity permits.
 *
 * @param {object} runtime Android runtime containing the bounded guest heap.
 * @param {object} record Resolved Java method record and descriptor.
 * @param {Array<unknown>} args Receiver followed by an optional target array.
 * @returns {object} Guest reference to the populated array.
 */
export function javaListToArray(runtime, record, args) {
	const values = javaListValues(runtime, args[0]);
	const supplied = hasSuppliedArray(record) ? args[1] : null;
	const array = selectArray(runtime, supplied, values.length);
	values.forEach((value, index) => {
		runtime.heap.arraySet(array, index, value);
	});
	if (runtime.heap.arrayLength(array) > values.length) {
		runtime.heap.arraySet(array, values.length, 0);
	}
	return array;
}

/**
 * Detects the typed overload from the guest descriptor rather than truthiness.
 *
 * @param {object} record Resolved Java method record.
 * @returns {boolean} Whether the caller supplied a destination array.
 */
function hasSuppliedArray(record) {
	return record.method.descriptor.startsWith("([");
}

/**
 * Reuses a sufficiently large target or allocates its exact guest array type.
 *
 * @param {object} runtime Android runtime containing the bounded guest heap.
 * @param {object|null} supplied Optional guest array reference.
 * @param {number} requiredLength Number of list values to copy.
 * @returns {object} Guest array reference with enough capacity.
 */
function selectArray(runtime, supplied, requiredLength) {
	if (!supplied) {
		return runtime.heap.allocateArray(
			"[Ljava/lang/Object;",
			requiredLength
		);
	}
	const suppliedObject = runtime.heap.get(supplied);
	const suppliedLength = runtime.heap.arrayLength(supplied);
	if (suppliedLength >= requiredLength) return supplied;
	return runtime.heap.allocateArray(
		suppliedObject.type,
		requiredLength
	);
}
