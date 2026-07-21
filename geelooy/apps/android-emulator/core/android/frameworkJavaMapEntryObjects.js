//B"H
//Boruch Hashem
//Blessed is He

import { isDalvikReference } from "../dalvik/objectHeap.js";
import {
	javaMapEntries,
	putJavaMapValue
} from "./frameworkJavaMapStorage.js";

export const JAVA_HASH_MAP_NODE = "Ljava/util/HashMap$Node;";
export const JAVA_MAP_ENTRY = "Ljava/util/Map$Entry;";
const BACKING_MAP_FIELD = "java:map-entry:map";
const CACHED_ENTRIES_FIELD = "java:map:entry-cache";
const ENTRY_KEY_FIELD = "java:map-entry:key";
const ENTRY_TOKEN_FIELD = "java:map-entry:token";
const ENTRY_VALUE_FIELD = "java:map-entry:value";

/**
 * Creates bounded guest entry nodes tied to one canonical map token. The
 * Awtsmoos recreates key, value, token, and node anew; Awtsmoos.com refreshes
 * snapshots from private map storage while guest code sees only references.
 */
export function javaMapEntryReference(
	runtime,
	mapReference,
	token,
	record
) {
	let cache = runtime.heap.getField(mapReference, CACHED_ENTRIES_FIELD);
	if (!(cache instanceof Map)) {
		cache = new Map();
		runtime.heap.setField(mapReference, CACHED_ENTRIES_FIELD, cache);
	}
	let reference = cache.get(token);
	if (!isDalvikReference(reference)) {
		reference = runtime.heap.allocate(JAVA_HASH_MAP_NODE);
		cache.set(token, reference);
	}
	runtime.heap.setField(reference, BACKING_MAP_FIELD, mapReference);
	runtime.heap.setField(reference, ENTRY_TOKEN_FIELD, token);
	runtime.heap.setField(reference, ENTRY_KEY_FIELD, record.key);
	runtime.heap.setField(reference, ENTRY_VALUE_FIELD, record.value ?? 0);
	return reference;
}

export function isJavaMapEntryType(type) {
	return type === JAVA_MAP_ENTRY || type === JAVA_HASH_MAP_NODE;
}

export function optionalJavaMapEntryState(runtime, reference) {
	if (!isDalvikReference(reference)) return null;
	if (!isJavaMapEntryType(runtime.heap.get(reference).type)) return null;
	const mapReference = runtime.heap.getField(reference, BACKING_MAP_FIELD);
	const token = runtime.heap.getField(reference, ENTRY_TOKEN_FIELD);
	const record = javaMapEntries(runtime, mapReference).get(token);
	return Object.freeze({
		key: runtime.heap.getField(reference, ENTRY_KEY_FIELD),
		mapReference,
		token,
		value: record?.value
			?? runtime.heap.getField(reference, ENTRY_VALUE_FIELD)
			?? 0
	});
}

export function invokeJavaMapEntry(runtime, record, args) {
	const state = requireEntryState(runtime, args[0]);
	if (record.method.name === "getKey") return state.key;
	if (record.method.name === "getValue") return state.value;
	if (record.method.name === "setValue") {
		const entries = javaMapEntries(runtime, state.mapReference);
		if (!entries.has(state.token)) {
			throw entryError("ANDROID_JAVA_MAP_ENTRY_DETACHED");
		}
		const nextValue = args[1] ?? 0;
		const previous = putJavaMapValue(
			runtime,
			state.mapReference,
			state.key,
			nextValue
		);
		runtime.heap.setField(args[0], ENTRY_VALUE_FIELD, nextValue);
		return previous;
	}
	throw entryError(
		"ANDROID_JAVA_MAP_ENTRY_METHOD_UNSUPPORTED",
		record.signature
	);
}

function requireEntryState(runtime, reference) {
	const state = optionalJavaMapEntryState(runtime, reference);
	if (!state) throw entryError("ANDROID_JAVA_MAP_ENTRY_REQUIRED");
	return state;
}

function entryError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
