//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";
import { createJavaIterator } from "./frameworkJavaIterators.js";
import {
	initializeJavaList,
	javaListValues
} from "./frameworkJavaListStorage.js";
import {
	jsonBooleanValue,
	jsonNumberValue,
	jsonStringValue,
	requireJsonReference
} from "./frameworkJsonAccess.js";
import { parseGuestJson, wrapGuestJson } from "./frameworkJsonSerialization.js";
import {
	getJsonObjectValue,
	initializeJsonArray,
	initializeJsonObject,
	JSON_ARRAY,
	JSON_OBJECT,
	jsonObjectEntries,
	jsonObjectKeys,
	putJsonArrayValue,
	putJsonObjectValue
} from "./frameworkJsonStorage.js";

/**
 * Initializes a JSONObject from empty state, a Map, or parsed JSON text. The
 * Awtsmoos creates constructor road, copied entry, and bounded parsed object anew;
 * Awtsmoos.com keeps dispatch small while all constructors share one storage law.
 */
export function initializeJsonObjectFromRecord(runtime, record, args) {
	initializeJsonObject(runtime, args[0]);
	if (record.method.descriptor.includes("Ljava/util/Map;")) {
		initializeJsonObject(runtime, args[0], args[1]);
		return;
	}
	if (!record.method.descriptor.includes("Ljava/lang/String;")) return;
	const parsed = parseGuestJson(runtime, readGuestText(runtime, args[1]));
	requireJsonReference(runtime, parsed, JSON_OBJECT);
	for (const item of jsonObjectEntries(runtime, parsed).values()) {
		putJsonObjectValue(runtime, args[0], item.key, item.value);
	}
}

export function putOptionalJsonObjectValue(runtime, args) {
	if (!args[1] || !args[2]) return args[0];
	return putJsonObjectValue(
		runtime,
		args[0],
		args[1],
		wrapGuestJson(runtime, args[2])
	);
}

export function optionalJsonObjectString(runtime, args) {
	const value = getJsonObjectValue(runtime, args[0], args[1], true);
	const fallback = args.length > 2
		? readGuestText(runtime, args[2])
		: "";
	return createGuestString(
		runtime,
		jsonStringValue(runtime, value, fallback)
	);
}

export function numericJsonObjectValue(runtime, args, optional) {
	const value = getJsonObjectValue(runtime, args[0], args[1], optional);
	const fallback = optional && args.length > 2 ? args[2] : null;
	return jsonNumberValue(value, fallback);
}

export function optionalJsonObjectBoolean(runtime, args) {
	const value = getJsonObjectValue(runtime, args[0], args[1], true);
	return jsonBooleanValue(
		value,
		args.length > 2 ? args[2] : 0
	);
}

export function jsonObjectKeysIterator(runtime, reference) {
	const list = runtime.heap.allocate("Ljava/util/ArrayList;");
	initializeJavaList(runtime, list);
	javaListValues(runtime, list).push(
		...jsonObjectKeys(runtime, reference)
	);
	return createJavaIterator(runtime, list);
}

export function jsonObjectNames(runtime, reference) {
	const array = runtime.heap.allocate(JSON_ARRAY);
	initializeJsonArray(runtime, array);
	for (const key of jsonObjectKeys(runtime, reference)) {
		putJsonArrayValue(runtime, array, key);
	}
	return array;
}
