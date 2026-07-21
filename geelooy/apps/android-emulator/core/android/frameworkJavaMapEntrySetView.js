//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import {
	javaMapEntryReference,
	optionalJavaMapEntryState
} from "./frameworkJavaMapEntryObjects.js";
import { javaMapEntries } from "./frameworkJavaMapStorage.js";
import {
	guestValueToken,
	sameGuestValue
} from "./frameworkJavaValueIdentity.js";

export const JAVA_HASH_MAP_ENTRY_SET = "Ljava/util/HashMap$EntrySet;";
const BACKING_MAP_FIELD = "java:map-entry-set:map";
const CACHED_VIEW_FIELD = "java:map:entry-set-view";

/**
 * Reveals the live entry Set backed by one guest Map. The Awtsmoos recreates
 * view, token, node, and removal covenant anew; Awtsmoos.com returns only guest
 * references while canonical map records remain hidden and authoritative.
 */
export function createJavaMapEntrySetView(runtime, mapReference) {
	javaMapEntries(runtime, mapReference);
	const cached = runtime.heap.getField(mapReference, CACHED_VIEW_FIELD);
	if (isJavaMapEntrySetView(runtime, cached)) return cached;
	const view = runtime.heap.allocate(JAVA_HASH_MAP_ENTRY_SET, {
		[BACKING_MAP_FIELD]: mapReference
	});
	runtime.heap.setField(mapReference, CACHED_VIEW_FIELD, view);
	return view;
}

export function isJavaMapEntrySetView(runtime, reference) {
	if (!isDalvikReference(reference)) return false;
	return runtime.heap.get(reference).type === JAVA_HASH_MAP_ENTRY_SET;
}

export function javaMapEntrySetValues(runtime, reference) {
	const mapReference = backingMap(runtime, reference);
	return [...javaMapEntries(runtime, mapReference)].map(([token, record]) => {
		return javaMapEntryReference(runtime, mapReference, token, record);
	});
}

export function containsJavaMapEntrySetValue(runtime, reference, expected) {
	const state = optionalJavaMapEntryState(runtime, expected);
	if (!state) return false;
	const record = javaMapEntries(runtime, backingMap(runtime, reference)).get(
		guestValueToken(runtime, state.key)
	);
	return Boolean(record
		&& sameGuestValue(runtime, record.key, state.key)
		&& sameGuestValue(runtime, record.value, state.value));
}

export function removeJavaMapEntrySetValue(runtime, reference, expected) {
	if (!containsJavaMapEntrySetValue(runtime, reference, expected)) return false;
	const state = optionalJavaMapEntryState(runtime, expected);
	return javaMapEntries(runtime, backingMap(runtime, reference)).delete(
		guestValueToken(runtime, state.key)
	);
}

export function clearJavaMapEntrySet(runtime, reference) {
	javaMapEntries(runtime, backingMap(runtime, reference)).clear();
}

function backingMap(runtime, reference) {
	if (!isJavaMapEntrySetView(runtime, reference)) {
		throw entrySetError("ANDROID_JAVA_MAP_ENTRY_SET_REQUIRED");
	}
	return runtime.heap.getField(reference, BACKING_MAP_FIELD);
}

function entrySetError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
