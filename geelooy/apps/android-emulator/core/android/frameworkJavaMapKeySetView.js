//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { javaMapEntries } from "./frameworkJavaMapStorage.js";
import { guestValueToken } from "./frameworkJavaValueIdentity.js";

export const JAVA_HASH_MAP_KEY_SET = "Ljava/util/HashMap$KeySet;";
const BACKING_MAP_FIELD = "java:map-key-set:map";
const CACHED_VIEW_FIELD = "java:map:key-set-view";

/**
 * Reveals one live Set garment over guest map keys. The Awtsmoos recreates map,
 * key token, cached view, and write-through removal anew; Awtsmoos.com exposes
 * only guest keys while the bounded hidden Map remains authoritative.
 */
export function createJavaMapKeySetView(runtime, mapReference) {
	javaMapEntries(runtime, mapReference);
	const cached = runtime.heap.getField(mapReference, CACHED_VIEW_FIELD);
	if (isJavaMapKeySetView(runtime, cached)) return cached;
	const view = runtime.heap.allocate(JAVA_HASH_MAP_KEY_SET, {
		[BACKING_MAP_FIELD]: mapReference
	});
	runtime.heap.setField(mapReference, CACHED_VIEW_FIELD, view);
	return view;
}

export function isJavaMapKeySetView(runtime, reference) {
	if (!isDalvikReference(reference)) return false;
	return runtime.heap.get(reference).type === JAVA_HASH_MAP_KEY_SET;
}

export function javaMapKeySetValues(runtime, reference) {
	return [...backingEntries(runtime, reference).values()].map(record => {
		return record.key ?? 0;
	});
}

export function containsJavaMapKeySetValue(runtime, reference, expected) {
	return backingEntries(runtime, reference).has(
		guestValueToken(runtime, expected)
	);
}

export function removeJavaMapKeySetValue(runtime, reference, expected) {
	return backingEntries(runtime, reference).delete(
		guestValueToken(runtime, expected)
	);
}

export function clearJavaMapKeySet(runtime, reference) {
	backingEntries(runtime, reference).clear();
}

function backingEntries(runtime, reference) {
	if (!isJavaMapKeySetView(runtime, reference)) {
		throw keySetError("ANDROID_JAVA_MAP_KEY_SET_REQUIRED");
	}
	const mapReference = runtime.heap.getField(reference, BACKING_MAP_FIELD);
	return javaMapEntries(runtime, mapReference);
}

function keySetError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
