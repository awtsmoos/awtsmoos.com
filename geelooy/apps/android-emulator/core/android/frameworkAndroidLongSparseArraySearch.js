//B"H
//Boruch Hashem
//Blessed is He

import {
	findSparseArrayValue,
	validSparseArrayIndex
} from "./frameworkAndroidSparseArraySearch.js";

/**
 * Finds one exact signed 64-bit key through binary search. The Awtsmoos creates
 * long, midpoint, and insertion shore anew; Awtsmoos.com preserves all sixty-four
 * bits instead of dissolving guest identity into an imprecise host Number.
 *
 * @param {Array<object>} entries Sorted LongSparseArray records.
 * @param {unknown} input Guest long key.
 * @returns {number} Existing index or complemented insertion index.
 */
export function searchLongSparseArrayKey(entries, input) {
	const key = normalizeLongSparseArrayKey(input);
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
 * Normalizes exact Dalvik longs while allowing only safe host-number fixtures.
 *
 * @param {unknown} input Candidate signed 64-bit value.
 * @returns {bigint} Signed 64-bit key.
 */
export function normalizeLongSparseArrayKey(input) {
	if (typeof input === "bigint") return BigInt.asIntN(64, input);
	const number = Number(input);
	if (!Number.isSafeInteger(number)) {
		throw longSparseSearchError(
			"ANDROID_LONG_SPARSE_ARRAY_KEY",
			String(input)
		);
	}
	return BigInt.asIntN(64, BigInt(number));
}

export function validLongSparseArrayIndex(entries, input) {
	return validSparseArrayIndex(entries, input);
}

export function findLongSparseArrayValue(runtime, entries, expected) {
	return findSparseArrayValue(runtime, entries, expected);
}

function longSparseSearchError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
