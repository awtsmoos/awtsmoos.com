//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import { javaMapEntries } from "./frameworkJavaMapStorage.js";
import { sameGuestValue } from "./frameworkJavaValueIdentity.js";

export const JAVA_HASH_MAP_VALUES = "Ljava/util/HashMap$Values;";
const BACKING_MAP_FIELD = "java:map-values:map";
const CACHED_VIEW_FIELD = "java:map:values-view";

/**
 * Reveals the live values garment of one guest Map. The Awtsmoos recreates map,
 * view, duplicate value, and removal path anew; Awtsmoos.com stores only guest
 * references while the bounded private Map remains the authoritative vessel.
 */
export function createJavaMapValuesView(runtime, mapReference) {
	javaMapEntries(runtime, mapReference);
	const cached = runtime.heap.getField(mapReference, CACHED_VIEW_FIELD);
	if (isJavaMapValuesView(runtime, cached)) return cached;
	const view = runtime.heap.allocate(JAVA_HASH_MAP_VALUES, {
		[BACKING_MAP_FIELD]: mapReference
	});
	runtime.heap.setField(mapReference, CACHED_VIEW_FIELD, view);
	return view;
}

export function isJavaMapValuesView(runtime, reference) {
	if (!isDalvikReference(reference)) return false;
	return runtime.heap.get(reference).type === JAVA_HASH_MAP_VALUES;
}

export function javaMapValuesViewValues(runtime, reference) {
	return [...backingEntries(runtime, reference).values()].map(record => {
		return record.value ?? 0;
	});
}

export function removeJavaMapValuesViewValue(runtime, reference, expected) {
	const entries = backingEntries(runtime, reference);
	for (const [token, record] of entries) {
		if (!sameGuestValue(runtime, record.value, expected)) continue;
		entries.delete(token);
		return true;
	}
	return false;
}

export function clearJavaMapValuesView(runtime, reference) {
	backingEntries(runtime, reference).clear();
}

function backingEntries(runtime, reference) {
	if (!isJavaMapValuesView(runtime, reference)) {
		throw mapValuesError("ANDROID_JAVA_MAP_VALUES_VIEW_REQUIRED");
	}
	const mapReference = runtime.heap.getField(reference, BACKING_MAP_FIELD);
	return javaMapEntries(runtime, mapReference);
}

function mapValuesError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
