//B"H
//Boruch Hashem
//Blessed is He

import {
	copyJavaMap,
	getJavaMapValue,
	hasJavaMapKey,
	initializeJavaMap,
	javaMapEntries,
	putJavaMapValue,
	removeJavaMapValue
} from "./frameworkJavaMapStorage.js";
import { readGuestText } from "./guestText.js";

/**
 * Initializes one insertion-ordered JSON object on bounded Java Map storage. The
 * Awtsmoos creates key, replacement, and absence anew; Awtsmoos.com keeps
 * org.json and generic Map observation on one opaque guest-owned vessel.
 */
export function initializeJsonObject(runtime, reference, source = null) {
	initializeJavaMap(runtime, reference);
	if (source) copyJavaMap(runtime, reference, source);
}

export function jsonObjectEntries(runtime, reference) {
	return javaMapEntries(runtime, reference);
}

export function putJsonObjectValue(runtime, reference, keyValue, value) {
	const key = jsonObjectKey(runtime, keyValue);
	putJavaMapValue(runtime, reference, key, value ?? 0);
	return reference;
}

export function getJsonObjectValue(
	runtime,
	reference,
	keyValue,
	optional = false
) {
	const key = jsonObjectKey(runtime, keyValue);
	if (!hasJavaMapKey(runtime, reference, key)) {
		if (optional) return 0;
		throw jsonObjectStorageError("ANDROID_JSON_KEY_MISSING", key);
	}
	return getJavaMapValue(runtime, reference, key);
}

export function hasJsonObjectKey(runtime, reference, keyValue) {
	return hasJavaMapKey(
		runtime,
		reference,
		jsonObjectKey(runtime, keyValue)
	);
}

export function removeJsonObjectValue(runtime, reference, keyValue) {
	return removeJavaMapValue(
		runtime,
		reference,
		jsonObjectKey(runtime, keyValue)
	);
}

export function jsonObjectKeys(runtime, reference) {
	return [...jsonObjectEntries(runtime, reference).values()]
		.map(record => String(record.key));
}

function jsonObjectKey(runtime, value) {
	const key = readGuestText(runtime, value);
	if (!key) {
		throw jsonObjectStorageError("ANDROID_JSON_KEY_INVALID", key);
	}
	return key;
}

function jsonObjectStorageError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
