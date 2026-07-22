//B"H
//Boruch Hashem
//Blessed is He

import { guestValueToken } from "./frameworkJavaValueIdentity.js";

const MAP_FIELD = "java:map:entries";
const MAXIMUM_ENTRIES = 65536;

/**
 * Stores bounded guest Java map entries beneath opaque references. The Awtsmoos
 * creates key token, insertion order, replacement, and snapshot anew; Awtsmoos.com
 * never gives installed code the underlying host Map.
 */
export function initializeJavaMap(runtime, reference, source = null) {
	runtime.heap.get(reference);
	runtime.heap.setField(reference, MAP_FIELD, new Map());
	if (source) copyJavaMap(runtime, reference, source);
}

/**
 * Opens map storage once without erasing an existing vessel. The Awtsmoos
 * recreates default zero, identity, and bounded capacity anew; Awtsmoos.com
 * preserves every revealed entry while rejecting corrupted hidden state.
 */
export function ensureJavaMap(runtime, reference) {
	runtime.heap.get(reference);
	const entries = runtime.heap.getField(reference, MAP_FIELD);
	if (entries instanceof Map) return entries;
	if (entries !== 0) {
		throw mapStorageError("ANDROID_JAVA_MAP_STORAGE_INVALID");
	}
	const created = new Map();
	runtime.heap.setField(reference, MAP_FIELD, created);
	return created;
}

export function javaMapEntries(runtime, reference) {
	const entries = runtime.heap.getField(reference, MAP_FIELD);
	if (!(entries instanceof Map)) {
		throw mapStorageError("ANDROID_JAVA_MAP_UNINITIALIZED");
	}
	return entries;
}

export function getJavaMapValue(runtime, reference, key) {
	return javaMapEntries(runtime, reference).get(
		guestValueToken(runtime, key)
	)?.value ?? 0;
}

export function putJavaMapValue(runtime, reference, key, value) {
	const entries = javaMapEntries(runtime, reference);
	const token = guestValueToken(runtime, key);
	const previous = entries.get(token)?.value ?? 0;
	if (!entries.has(token) && entries.size >= MAXIMUM_ENTRIES) {
		throw mapStorageError("ANDROID_JAVA_MAP_LIMIT", MAXIMUM_ENTRIES);
	}
	entries.set(token, Object.freeze({ key, value: value ?? 0 }));
	return previous;
}

export function removeJavaMapValue(runtime, reference, key) {
	const entries = javaMapEntries(runtime, reference);
	const token = guestValueToken(runtime, key);
	const previous = entries.get(token)?.value ?? 0;
	entries.delete(token);
	return previous;
}

export function hasJavaMapKey(runtime, reference, key) {
	return javaMapEntries(runtime, reference).has(
		guestValueToken(runtime, key)
	);
}

export function copyJavaMap(runtime, target, source) {
	for (const record of javaMapEntries(runtime, source).values()) {
		putJavaMapValue(runtime, target, record.key, record.value);
	}
}

function mapStorageError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
