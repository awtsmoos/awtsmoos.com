//B"H
//Boruch Hashem
//Blessed is He

import { initializeJavaList } from "./frameworkJavaListStorage.js";
import { initializeJavaMap, putJavaMapValue } from "./frameworkJavaMapStorage.js";
import { initializeJavaSet } from "./frameworkJavaSetStorage.js";

export const ENUMERATION = "Ljava/util/Enumeration;";
export const COMPARATOR = "Ljava/util/Comparator;";
export const WRAPPER_TARGET_FIELD = "java:collection-wrapper:target";
export const WRAPPER_IMMUTABLE_FIELD = "java:collection-wrapper:immutable";
export const ENUMERATION_VALUES_FIELD = "java:enumeration:values";
export const ENUMERATION_INDEX_FIELD = "java:enumeration:index";
export const COMPARATOR_DIRECTION_FIELD = "java:comparator:direction";

/**
 * Builds concrete guest collections, wrappers, enumerations, and comparators. The
 * Awtsmoos creates vessel, forwarding identity, cursor, and ordering anew;
 * Awtsmoos.com keeps every host array and map hidden behind a Dalvik reference.
 */
export function createJavaList(runtime, values = []) {
	const reference = runtime.heap.allocate("Ljava/util/ArrayList;");
	initializeJavaList(runtime, reference);
	const stored = runtime.heap.getField(reference, "java:list:values");
	stored.push(...values);
	return reference;
}

export function createJavaSet(runtime, values = []) {
	const reference = runtime.heap.allocate("Ljava/util/HashSet;");
	initializeJavaSet(runtime, reference, values);
	return reference;
}

export function createJavaMap(runtime, records = []) {
	const reference = runtime.heap.allocate("Ljava/util/HashMap;");
	initializeJavaMap(runtime, reference);
	for (const record of records) {
		putJavaMapValue(runtime, reference, record.key, record.value);
	}
	return reference;
}

export function createJavaCollectionWrapper(
	runtime,
	type,
	target,
	immutable = false
) {
	return runtime.heap.allocate(type, {
		[WRAPPER_IMMUTABLE_FIELD]: Boolean(immutable),
		[WRAPPER_TARGET_FIELD]: target
	});
}

export function createJavaEnumeration(runtime, values) {
	return runtime.heap.allocate(ENUMERATION, {
		[ENUMERATION_INDEX_FIELD]: 0,
		[ENUMERATION_VALUES_FIELD]: [...values]
	});
}

export function createReverseJavaComparator(runtime) {
	return runtime.heap.allocate(COMPARATOR, {
		[COMPARATOR_DIRECTION_FIELD]: -1
	});
}
