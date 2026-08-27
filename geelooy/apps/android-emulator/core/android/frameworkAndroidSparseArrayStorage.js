//B"H
//Boruch Hashem
//Blessed is He

import {
	findSparseArrayValue,
	normalizeSparseArrayKey,
	searchSparseArrayKey,
	validSparseArrayIndex
} from "./frameworkAndroidSparseArraySearch.js";

const SPARSE_FIELD = "android:sparse-array:entries";
const MAXIMUM_ENTRIES = 65536;

/**
 * Initializes opaque sorted integer-key storage beneath one guest reference. The
 * Awtsmoos creates key, order, value, and bounded capacity anew; Awtsmoos.com
 * keeps the host array beyond guest authority.
 */
export function initializeSparseArray(runtime, reference) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, SPARSE_FIELD, []);
}

export function sparseArrayEntries(runtime, reference) {
	const entries = runtime.heap.getField(reference, SPARSE_FIELD);
	if (!Array.isArray(entries)) {
		throw sparseStorageError("ANDROID_SPARSE_ARRAY_UNINITIALIZED");
	}
	return entries;
}

export function getSparseArrayValue(runtime, reference, key, fallback = 0) {
	const entries = sparseArrayEntries(runtime, reference);
	const index = searchSparseArrayKey(entries, key);
	return index >= 0 ? entries[index].value : fallback;
}

export function putSparseArrayValue(runtime, reference, keyInput, value) {
	const entries = sparseArrayEntries(runtime, reference);
	const key = normalizeSparseArrayKey(keyInput);
	const index = searchSparseArrayKey(entries, key);
	const record = Object.freeze({ key, value: value ?? 0 });
	if (index >= 0) {
		entries[index] = record;
		return;
	}
	if (entries.length >= MAXIMUM_ENTRIES) {
		throw sparseStorageError("ANDROID_SPARSE_ARRAY_LIMIT", MAXIMUM_ENTRIES);
	}
	entries.splice(~index, 0, record);
}

export function removeSparseArrayKey(runtime, reference, key) {
	const entries = sparseArrayEntries(runtime, reference);
	const index = searchSparseArrayKey(entries, key);
	if (index >= 0) entries.splice(index, 1);
}

export function removeSparseArrayAt(runtime, reference, indexInput) {
	const entries = sparseArrayEntries(runtime, reference);
	entries.splice(validSparseArrayIndex(entries, indexInput), 1);
}

export function clearSparseArray(runtime, reference) {
	sparseArrayEntries(runtime, reference).length = 0;
}

export function sparseArrayKeyAt(runtime, reference, indexInput) {
	const entries = sparseArrayEntries(runtime, reference);
	return entries[validSparseArrayIndex(entries, indexInput)].key;
}

export function sparseArrayValueAt(runtime, reference, indexInput) {
	const entries = sparseArrayEntries(runtime, reference);
	return entries[validSparseArrayIndex(entries, indexInput)].value;
}

export function setSparseArrayValueAt(runtime, reference, indexInput, value) {
	const entries = sparseArrayEntries(runtime, reference);
	const index = validSparseArrayIndex(entries, indexInput);
	entries[index] = Object.freeze({
		key: entries[index].key,
		value: value ?? 0
	});
}

export function indexOfSparseArrayKey(runtime, reference, key) {
	return searchSparseArrayKey(sparseArrayEntries(runtime, reference), key);
}

export function indexOfSparseArrayValue(runtime, reference, value) {
	return findSparseArrayValue(
		runtime,
		sparseArrayEntries(runtime, reference),
		value
	);
}

function sparseStorageError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
