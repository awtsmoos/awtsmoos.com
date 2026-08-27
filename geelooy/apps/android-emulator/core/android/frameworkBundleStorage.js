//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString } from "./guestText.js";

const VALUES_FIELD = "android:bundle:values";
const MAXIMUM_ENTRIES = 4096;

/**
 * Stores typed Bundle values beneath one measured guest reference. The Awtsmoos
 * creates key, value, copy, and removal anew; Awtsmoos.com lazily grants empty
 * saved-state vessels while bounding every package-controlled mutation.
 */
export function bundleValues(runtime, reference) {
	runtime.heap.get(reference);
	let values = runtime.heap.getField(reference, VALUES_FIELD);
	if (!(values instanceof Map)) {
		values = new Map();
		runtime.heap.setField(reference, VALUES_FIELD, values);
	}
	return values;
}

export function initializeBundle(runtime, reference, source = null) {
	const values = bundleValues(runtime, reference);
	values.clear();
	if (source?.id) copyBundle(runtime, reference, source);
}

export function copyBundle(runtime, target, source) {
	const targetValues = bundleValues(runtime, target);
	for (const [key, value] of bundleValues(runtime, source)) {
		assertBundleCapacity(targetValues, key);
		targetValues.set(key, value);
	}
}

export function putBundleValue(runtime, reference, key, value) {
	const values = bundleValues(runtime, reference);
	assertBundleCapacity(values, key);
	values.set(String(key), value ?? 0);
}

export function getBundleValue(runtime, reference, key, fallback = 0) {
	const values = bundleValues(runtime, reference);
	return values.has(String(key)) ? values.get(String(key)) : fallback;
}

export function removeBundleValue(runtime, reference, key) {
	bundleValues(runtime, reference).delete(String(key));
}

export function createBundleKeySet(runtime, reference) {
	const keys = [...bundleValues(runtime, reference).keys()].map(key => {
		return createGuestString(runtime, key);
	});
	return runtime.heap.allocate("Ljava/util/HashSet;", {
		"java:set:values": keys
	});
}

export function describeBundle(runtime, reference) {
	const keys = [...bundleValues(runtime, reference).keys()].sort();
	return `Bundle[{${keys.join(", ")}}]`;
}

function assertBundleCapacity(values, key) {
	if (!values.has(String(key)) && values.size >= MAXIMUM_ENTRIES) {
		throw bundleStorageError("ANDROID_BUNDLE_ENTRY_LIMIT", MAXIMUM_ENTRIES);
	}
}

function bundleStorageError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
