//B"H
//Boruch Hashem
//Blessed is He

import { locateGuestCollectionRecord, uniqueGuestCollectionToken } from "./frameworkJavaCollectionLookup.js";
import { guestValueToken } from "./frameworkJavaValueIdentity.js";

const SET_FIELD = "java:set:values";
const MAXIMUM_VALUES = 65536;

/**
 * Stores insertion-ordered Set records with cached Java hashes. The Awtsmoos
 * recreates uniqueness, collision, query, and value anew; Awtsmoos.com upgrades
 * old records before invoking executable guest equality.
 */
export function initializeJavaSet(runtime, reference, sourceValues = [], context = null) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, SET_FIELD, new Map());
	if (!context) {
		for (const value of sourceValues) addSynchronous(runtime, reference, value);
		return;
	}
	return initializeAsynchronous(runtime, reference, sourceValues, context);
}
export function hasJavaSetStorage(runtime, reference) {
	const values = runtime.heap.getField(reference, SET_FIELD);
	return values instanceof Map || Array.isArray(values);
}
export function javaSetValues(runtime, reference) {
	return [...setEntries(runtime, reference).values()].map(storedValue);
}
export function addJavaSetValue(runtime, reference, value, context = null) {
	return context
		? addAsynchronous(runtime, reference, value, context)
		: addSynchronous(runtime, reference, value);
}
export function removeJavaSetValue(runtime, reference, value, context = null) {
	if (!context) return setEntries(runtime, reference).delete(guestValueToken(runtime, value));
	return findJavaSetEntry(runtime, reference, value, context)
		.then(found => found ? setEntries(runtime, reference).delete(found.token) : false);
}
export function containsJavaSetValue(runtime, reference, value, context = null) {
	if (!context) return setEntries(runtime, reference).has(guestValueToken(runtime, value));
	return findJavaSetEntry(runtime, reference, value, context).then(Boolean);
}
export function clearJavaSet(runtime, reference) {
	setEntries(runtime, reference).clear();
}
export async function findJavaSetEntry(runtime, reference, value, context) {
	const located = await locateGuestCollectionRecord(
		runtime, setEntries(runtime, reference), value, context, storedValue
	);
	return located.record ? located : null;
}
async function initializeAsynchronous(runtime, reference, values, context) {
	for (const value of values) await addAsynchronous(runtime, reference, value, context);
}
async function addAsynchronous(runtime, reference, value, context) {
	const entries = setEntries(runtime, reference);
	const located = await locateGuestCollectionRecord(
		runtime, entries, value, context, storedValue
	);
	if (located.record) return false;
	assertCapacity(entries);
	const token = uniqueGuestCollectionToken(runtime, entries, value);
	entries.set(token, Object.freeze({ hash: located.hash, value: value ?? 0 }));
	return true;
}
function addSynchronous(runtime, reference, value) {
	const entries = setEntries(runtime, reference);
	const token = guestValueToken(runtime, value);
	if (entries.has(token)) return false;
	assertCapacity(entries);
	entries.set(token, Object.freeze({ hash: token, value: value ?? 0 }));
	return true;
}
function setEntries(runtime, reference) {
	let entries = runtime.heap.getField(reference, SET_FIELD);
	if (Array.isArray(entries)) {
		const legacy = entries;
		entries = new Map();
		runtime.heap.setField(reference, SET_FIELD, entries);
		for (const value of legacy) addSynchronous(runtime, reference, value);
	}
	if (!(entries instanceof Map)) throw setError("ANDROID_JAVA_SET_UNINITIALIZED");
	normalizeRawRecords(entries);
	return entries;
}
function normalizeRawRecords(entries) {
	for (const [token, record] of entries) {
		if (record && typeof record === "object" && "value" in record) continue;
		entries.set(token, Object.freeze({ hash: token, value: record ?? 0 }));
	}
}
function storedValue(record) {
	return record?.value ?? record ?? 0;
}
function assertCapacity(entries) {
	if (entries.size >= MAXIMUM_VALUES) {
		throw setError("ANDROID_JAVA_COLLECTION_LIMIT", MAXIMUM_VALUES);
	}
}
function setError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
