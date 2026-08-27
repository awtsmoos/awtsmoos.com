//B"H
//Boruch Hashem
//Blessed is He

import {
	findLongSparseArrayValue,
	normalizeLongSparseArrayKey,
	searchLongSparseArrayKey,
	validLongSparseArrayIndex
} from "./frameworkAndroidLongSparseArraySearch.js";

const LONG_SPARSE_FIELD = "android:long-sparse-array:entries";
const MAXIMUM_ENTRIES = 65536;

/**
 * Initializes sorted exact long-key storage beneath one guest reference. The
 * Awtsmoos creates sixty-four-bit key, value, and bounded capacity anew;
 * Awtsmoos.com keeps host storage opaque and every insertion deterministic.
 */
export function initializeLongSparseArray(runtime, reference) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, LONG_SPARSE_FIELD, []);
}

export function longSparseArrayEntries(runtime, reference) {
	const entries = runtime.heap.getField(reference, LONG_SPARSE_FIELD);
	if (!Array.isArray(entries)) {
		throw longSparseStorageError("ANDROID_LONG_SPARSE_ARRAY_UNINITIALIZED");
	}
	return entries;
}

export function getLongSparseArrayValue(runtime, reference, key, fallback = 0) {
	const entries = longSparseArrayEntries(runtime, reference);
	const index = searchLongSparseArrayKey(entries, key);
	return index >= 0 ? entries[index].value : fallback;
}

export function putLongSparseArrayValue(runtime, reference, keyInput, value) {
	const entries = longSparseArrayEntries(runtime, reference);
	const key = normalizeLongSparseArrayKey(keyInput);
	const index = searchLongSparseArrayKey(entries, key);
	const record = Object.freeze({ key, value: value ?? 0 });
	if (index >= 0) {
		entries[index] = record;
		return;
	}
	if (entries.length >= MAXIMUM_ENTRIES) {
		throw longSparseStorageError(
			"ANDROID_LONG_SPARSE_ARRAY_LIMIT",
			MAXIMUM_ENTRIES
		);
	}
	entries.splice(~index, 0, record);
}

export function removeLongSparseArrayKey(runtime, reference, key) {
	const entries = longSparseArrayEntries(runtime, reference);
	const index = searchLongSparseArrayKey(entries, key);
	if (index >= 0) entries.splice(index, 1);
}

export function removeLongSparseArrayAt(runtime, reference, indexInput) {
	const entries = longSparseArrayEntries(runtime, reference);
	entries.splice(validLongSparseArrayIndex(entries, indexInput), 1);
}

export function clearLongSparseArray(runtime, reference) {
	longSparseArrayEntries(runtime, reference).length = 0;
}

export function longSparseArrayKeyAt(runtime, reference, indexInput) {
	const entries = longSparseArrayEntries(runtime, reference);
	return entries[validLongSparseArrayIndex(entries, indexInput)].key;
}

export function longSparseArrayValueAt(runtime, reference, indexInput) {
	const entries = longSparseArrayEntries(runtime, reference);
	return entries[validLongSparseArrayIndex(entries, indexInput)].value;
}

export function setLongSparseArrayValueAt(runtime, reference, indexInput, value) {
	const entries = longSparseArrayEntries(runtime, reference);
	const index = validLongSparseArrayIndex(entries, indexInput);
	entries[index] = Object.freeze({
		key: entries[index].key,
		value: value ?? 0
	});
}

export function indexOfLongSparseArrayKey(runtime, reference, key) {
	return searchLongSparseArrayKey(
		longSparseArrayEntries(runtime, reference),
		key
	);
}

export function indexOfLongSparseArrayValue(runtime, reference, value) {
	return findLongSparseArrayValue(
		runtime,
		longSparseArrayEntries(runtime, reference),
		value
	);
}

function longSparseStorageError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
