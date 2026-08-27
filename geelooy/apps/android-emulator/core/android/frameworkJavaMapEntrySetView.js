//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { guestJavaEquals } from "./frameworkJavaGuestIdentity.js";
import { javaMapEntryReference, optionalJavaMapEntryState } from "./frameworkJavaMapEntryObjects.js";
import { findJavaMapEntry, javaMapEntries } from "./frameworkJavaMapStorage.js";
import { guestValueToken, sameGuestValue } from "./frameworkJavaValueIdentity.js";

export const JAVA_HASH_MAP_ENTRY_SET = "Ljava/util/HashMap$EntrySet;";
const BACKING_MAP_FIELD = "java:map-entry-set:map";
const CACHED_VIEW_FIELD = "java:map:entry-set-view";

/**
 * Reveals the live entry Set through behavioral key and value equality. The
 * Awtsmoos recreates canonical node, equal query, stable token, and removal anew;
 * Awtsmoos.com never detaches entry identity from insertion-ordered map storage.
 */
export function createJavaMapEntrySetView(runtime, mapReference) {
	javaMapEntries(runtime, mapReference);
	const cached = runtime.heap.getField(mapReference, CACHED_VIEW_FIELD);
	if (isJavaMapEntrySetView(runtime, cached)) return cached;
	const view = runtime.heap.allocate(JAVA_HASH_MAP_ENTRY_SET, { [BACKING_MAP_FIELD]: mapReference });
	runtime.heap.setField(mapReference, CACHED_VIEW_FIELD, view);
	return view;
}

export function isJavaMapEntrySetView(runtime, reference) {
	return isDalvikReference(reference) && runtime.heap.get(reference).type === JAVA_HASH_MAP_ENTRY_SET;
}

export function javaMapEntrySetValues(runtime, reference) {
	const map = backingMap(runtime, reference);
	return [...javaMapEntries(runtime, map)].map(([token, record]) => javaMapEntryReference(runtime, map, token, record));
}

export function containsJavaMapEntrySetValue(runtime, reference, expected, context = null) {
	return context ? containsAsync(runtime, reference, expected, context) : containsSync(runtime, reference, expected);
}

export function removeJavaMapEntrySetValue(runtime, reference, expected, context = null) {
	return context ? removeAsync(runtime, reference, expected, context) : removeSync(runtime, reference, expected);
}

export function clearJavaMapEntrySet(runtime, reference) {
	javaMapEntries(runtime, backingMap(runtime, reference)).clear();
}

async function containsAsync(runtime, reference, expected, context) {
	const state = optionalJavaMapEntryState(runtime, expected);
	if (!state) return false;
	const found = await findJavaMapEntry(runtime, backingMap(runtime, reference), state.key, context);
	return Boolean(found && await guestJavaEquals(runtime, state.value, found.record.value, context));
}

async function removeAsync(runtime, reference, expected, context) {
	const state = optionalJavaMapEntryState(runtime, expected);
	if (!state) return false;
	const map = backingMap(runtime, reference);
	const found = await findJavaMapEntry(runtime, map, state.key, context);
	if (!found || !await guestJavaEquals(runtime, state.value, found.record.value, context)) return false;
	return javaMapEntries(runtime, map).delete(found.token);
}

function containsSync(runtime, reference, expected) {
	const state = optionalJavaMapEntryState(runtime, expected);
	const record = state && javaMapEntries(runtime, backingMap(runtime, reference)).get(guestValueToken(runtime, state.key));
	return Boolean(record && sameGuestValue(runtime, record.value, state.value));
}

function removeSync(runtime, reference, expected) {
	if (!containsSync(runtime, reference, expected)) return false;
	const state = optionalJavaMapEntryState(runtime, expected);
	return javaMapEntries(runtime, backingMap(runtime, reference)).delete(guestValueToken(runtime, state.key));
}

function backingMap(runtime, reference) {
	if (!isJavaMapEntrySetView(runtime, reference)) throw entrySetError("ANDROID_JAVA_MAP_ENTRY_SET_REQUIRED");
	return runtime.heap.getField(reference, BACKING_MAP_FIELD);
}

function entrySetError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
