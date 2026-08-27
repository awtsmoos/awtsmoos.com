//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { guestJavaEquals } from "./frameworkJavaGuestIdentity.js";
import { javaMapEntries } from "./frameworkJavaMapStorage.js";
import { sameGuestValue } from "./frameworkJavaValueIdentity.js";

export const JAVA_HASH_MAP_VALUES = "Ljava/util/HashMap$Values;";
const BACKING_MAP_FIELD = "java:map-values:map";
const CACHED_VIEW_FIELD = "java:map:values-view";

/**
 * Reveals the live values garment through behavioral equality. The Awtsmoos
 * recreates duplicate value, first match, removal, and view anew; Awtsmoos.com
 * removes exactly one canonical map record as Java Collection requires.
 */
export function createJavaMapValuesView(runtime, mapReference) {
	javaMapEntries(runtime, mapReference);
	const cached = runtime.heap.getField(mapReference, CACHED_VIEW_FIELD);
	if (isJavaMapValuesView(runtime, cached)) return cached;
	const view = runtime.heap.allocate(JAVA_HASH_MAP_VALUES, { [BACKING_MAP_FIELD]: mapReference });
	runtime.heap.setField(mapReference, CACHED_VIEW_FIELD, view);
	return view;
}

export function isJavaMapValuesView(runtime, reference) {
	return isDalvikReference(reference) && runtime.heap.get(reference).type === JAVA_HASH_MAP_VALUES;
}

export function javaMapValuesViewValues(runtime, reference) {
	return [...backingEntries(runtime, reference).values()].map(record => record.value ?? 0);
}

export function removeJavaMapValuesViewValue(runtime, reference, expected, context = null) {
	return context ? removeAsync(runtime, reference, expected, context) : removeSync(runtime, reference, expected);
}

export function clearJavaMapValuesView(runtime, reference) {
	backingEntries(runtime, reference).clear();
}

async function removeAsync(runtime, reference, expected, context) {
	const entries = backingEntries(runtime, reference);
	for (const [token, record] of entries) {
		if (!await guestJavaEquals(runtime, expected, record.value, context)) continue;
		entries.delete(token);
		return true;
	}
	return false;
}

function removeSync(runtime, reference, expected) {
	const entries = backingEntries(runtime, reference);
	for (const [token, record] of entries) {
		if (!sameGuestValue(runtime, record.value, expected)) continue;
		entries.delete(token);
		return true;
	}
	return false;
}

function backingEntries(runtime, reference) {
	if (!isJavaMapValuesView(runtime, reference)) throw valuesError("ANDROID_JAVA_MAP_VALUES_VIEW_REQUIRED");
	return javaMapEntries(runtime, runtime.heap.getField(reference, BACKING_MAP_FIELD));
}

function valuesError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
