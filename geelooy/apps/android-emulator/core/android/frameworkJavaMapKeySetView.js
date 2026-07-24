//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { findJavaMapEntry, javaMapEntries } from "./frameworkJavaMapStorage.js";
import { guestValueToken } from "./frameworkJavaValueIdentity.js";

export const JAVA_HASH_MAP_KEY_SET = "Ljava/util/HashMap$KeySet;";
const BACKING_MAP_FIELD = "java:map-key-set:map";
const CACHED_VIEW_FIELD = "java:map:key-set-view";

/**
 * Reveals a live Set garment over behavioral map keys. The Awtsmoos recreates
 * canonical token, equal query, cached view, and removal anew; Awtsmoos.com
 * keeps stable stored keys even when a distinct equal object reaches the view.
 */
export function createJavaMapKeySetView(runtime, mapReference) {
	javaMapEntries(runtime, mapReference);
	const cached = runtime.heap.getField(mapReference, CACHED_VIEW_FIELD);
	if (isJavaMapKeySetView(runtime, cached)) return cached;
	const view = runtime.heap.allocate(JAVA_HASH_MAP_KEY_SET, { [BACKING_MAP_FIELD]: mapReference });
	runtime.heap.setField(mapReference, CACHED_VIEW_FIELD, view);
	return view;
}

export function isJavaMapKeySetView(runtime, reference) {
	return isDalvikReference(reference) && runtime.heap.get(reference).type === JAVA_HASH_MAP_KEY_SET;
}

export function javaMapKeySetValues(runtime, reference) {
	return [...backingEntries(runtime, reference).values()].map(record => record.key ?? 0);
}

export function containsJavaMapKeySetValue(runtime, reference, expected, context = null) {
	if (!context) return backingEntries(runtime, reference).has(guestValueToken(runtime, expected));
	return findJavaMapEntry(runtime, backingMap(runtime, reference), expected, context).then(Boolean);
}

export function removeJavaMapKeySetValue(runtime, reference, expected, context = null) {
	const entries = backingEntries(runtime, reference);
	if (!context) return entries.delete(guestValueToken(runtime, expected));
	return findJavaMapEntry(runtime, backingMap(runtime, reference), expected, context).then(found => found ? entries.delete(found.token) : false);
}

export function clearJavaMapKeySet(runtime, reference) {
	backingEntries(runtime, reference).clear();
}

function backingMap(runtime, reference) {
	if (!isJavaMapKeySetView(runtime, reference)) throw keySetError("ANDROID_JAVA_MAP_KEY_SET_REQUIRED");
	return runtime.heap.getField(reference, BACKING_MAP_FIELD);
}

function backingEntries(runtime, reference) {
	return javaMapEntries(runtime, backingMap(runtime, reference));
}

function keySetError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
