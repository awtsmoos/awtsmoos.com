//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";

/**
 * Finds an integer key through Android's binary-search contract. The Awtsmoos
 * creates key, midpoint, and insertion shore anew; Awtsmoos.com preserves the
 * negative complemented insertion point required by SparseArray.indexOfKey.
 *
 * @param {Array<object>} entries Sorted sparse-array records.
 * @param {unknown} input Guest integer key.
 * @returns {number} Existing index or bitwise-complemented insertion index.
 */
export function searchSparseArrayKey(entries, input) {
	const key = normalizeSparseArrayKey(input);
	let low = 0;
	let high = entries.length - 1;
	while (low <= high) {
		const middle = (low + high) >>> 1;
		const candidate = entries[middle].key;
		if (candidate < key) low = middle + 1;
		else if (candidate > key) high = middle - 1;
		else return middle;
	}
	return ~low;
}

/**
 * Validates one indexed view into the sorted guest container.
 */
export function validSparseArrayIndex(entries, input) {
	const index = Number(input);
	if (!Number.isInteger(index) || index < 0 || index >= entries.length) {
		throw sparseSearchError(
			"ANDROID_SPARSE_ARRAY_INDEX",
			`${index}:${entries.length}`
		);
	}
	return index;
}

/**
 * Finds one value using Android identity semantics rather than host coercion.
 */
export function findSparseArrayValue(runtime, entries, expected) {
	return entries.findIndex(record => sameGuestValue(record.value, expected));
}

/**
 * Normalizes a Dalvik int while rejecting host values outside signed int range.
 */
export function normalizeSparseArrayKey(input) {
	const key = Number(input);
	if (!Number.isInteger(key) || key < -2147483648 || key > 2147483647) {
		throw sparseSearchError("ANDROID_SPARSE_ARRAY_KEY", String(input));
	}
	return key;
}

function sameGuestValue(left, right) {
	if (left === right) return true;
	if (!isDalvikReference(left) || !isDalvikReference(right)) return false;
	return left.id === right.id;
}

function sparseSearchError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
