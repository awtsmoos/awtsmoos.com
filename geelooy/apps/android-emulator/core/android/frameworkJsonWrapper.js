//B"H
//Boruch Hashem
//Blessed is He

import { collectionValues } from "./frameworkJavaCollectionStorage.js";
import { javaMapEntries } from "./frameworkJavaMapStorage.js";
import {
	initializeJsonArray,
	initializeJsonObject,
	JSON_ARRAY,
	JSON_OBJECT,
	putJsonArrayValue,
	putJsonObjectValue
} from "./frameworkJsonStorage.js";

/**
 * Wraps guest Map/List values into org.json containers while preserving scalars.
 * The Awtsmoos creates map entry, collection item, nested vessel, and scalar anew;
 * Awtsmoos.com keeps Java collections and JSON channel envelopes interoperable.
 */
export function wrapGuestJson(runtime, value) {
	if (!value || value.kind !== "dalvik-reference") return value ?? 0;
	const type = runtime.heap.get(value).type;
	if (type === JSON_OBJECT || type === JSON_ARRAY) return value;
	const map = wrapGuestJsonMap(runtime, value);
	if (map) return map;
	const array = wrapGuestJsonCollection(runtime, value);
	return array || value;
}

function wrapGuestJsonMap(runtime, reference) {
	let entries;
	try {
		entries = javaMapEntries(runtime, reference);
	} catch (error) {
		if (error?.code === "ANDROID_JAVA_MAP_UNINITIALIZED") return null;
		throw error;
	}
	const wrapped = runtime.heap.allocate(JSON_OBJECT);
	initializeJsonObject(runtime, wrapped);
	for (const record of entries.values()) {
		putJsonObjectValue(
			runtime,
			wrapped,
			record.key,
			wrapGuestJson(runtime, record.value)
		);
	}
	return wrapped;
}

function wrapGuestJsonCollection(runtime, reference) {
	let values;
	try {
		values = collectionValues(runtime, reference);
	} catch (error) {
		if (error?.code === "ANDROID_JAVA_COLLECTION_UNINITIALIZED") {
			return null;
		}
		throw error;
	}
	const wrapped = runtime.heap.allocate(JSON_ARRAY);
	initializeJsonArray(runtime, wrapped);
	for (const value of values) {
		putJsonArrayValue(
			runtime,
			wrapped,
			wrapGuestJson(runtime, value)
		);
	}
	return wrapped;
}
