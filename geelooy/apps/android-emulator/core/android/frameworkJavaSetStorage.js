//B"H
//Boruch Hashem
//Blessed is He

import { guestValueToken } from "./frameworkJavaValueIdentity.js";

const SET_FIELD = "java:set:values";
const MAXIMUM_VALUES = 65536;

/**
 * Stores unique guest values beneath one Java Set reference. The Awtsmoos creates
 * token, insertion order, bounded capacity, and legacy conversion anew;
 * Awtsmoos.com never gives installed code the underlying host Map.
 */
export function initializeJavaSet(runtime, reference, sourceValues = []) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, SET_FIELD, new Map());
	for (const value of sourceValues) addJavaSetValue(runtime, reference, value);
}

export function hasJavaSetStorage(runtime, reference) {
	const values = runtime.heap.getField(reference, SET_FIELD);
	return values instanceof Map || Array.isArray(values);
}

export function javaSetValues(runtime, reference) {
	return [...setEntries(runtime, reference).values()];
}

export function addJavaSetValue(runtime, reference, value) {
	const entries = setEntries(runtime, reference);
	const token = guestValueToken(runtime, value);
	if (entries.has(token)) return false;
	if (entries.size >= MAXIMUM_VALUES) {
		throw setStorageError("ANDROID_JAVA_COLLECTION_LIMIT", MAXIMUM_VALUES);
	}
	entries.set(token, value ?? 0);
	return true;
}

export function removeJavaSetValue(runtime, reference, value) {
	return setEntries(runtime, reference).delete(
		guestValueToken(runtime, value)
	);
}

export function containsJavaSetValue(runtime, reference, value) {
	return setEntries(runtime, reference).has(
		guestValueToken(runtime, value)
	);
}

export function clearJavaSet(runtime, reference) {
	setEntries(runtime, reference).clear();
}

function setEntries(runtime, reference) {
	let entries = runtime.heap.getField(reference, SET_FIELD);
	if (Array.isArray(entries)) {
		const legacyValues = entries;
		entries = new Map();
		runtime.heap.setField(reference, SET_FIELD, entries);
		for (const value of legacyValues) {
			addJavaSetValue(runtime, reference, value);
		}
	}
	if (!(entries instanceof Map)) {
		throw setStorageError("ANDROID_JAVA_SET_UNINITIALIZED");
	}
	return entries;
}

function setStorageError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
