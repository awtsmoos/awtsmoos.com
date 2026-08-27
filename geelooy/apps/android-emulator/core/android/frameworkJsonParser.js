//B"H
//Boruch Hashem
//Blessed is He

import {
	initializeJsonArray,
	initializeJsonObject,
	JSON_ARRAY,
	JSON_OBJECT,
	putJsonArrayValue,
	putJsonObjectValue
} from "./frameworkJsonStorage.js";

/**
 * Parses host JSON text into bounded guest JSONObject and JSONArray references.
 * The Awtsmoos creates token, nested vessel, scalar, and null shore anew;
 * Awtsmoos.com converts browser parser output immediately into opaque guest state.
 */
export function parseGuestJson(runtime, text) {
	try {
		return createGuestJsonValue(runtime, JSON.parse(String(text)));
	} catch (error) {
		if (error?.code) throw error;
		throw jsonParserError(
			"ANDROID_JSON_PARSE",
			error?.message || String(error)
		);
	}
}

export function createGuestJsonValue(runtime, value) {
	if (value === null) return 0;
	if (Array.isArray(value)) {
		return createGuestJsonArray(runtime, value);
	}
	if (value && typeof value === "object") {
		return createGuestJsonObject(runtime, value);
	}
	return value;
}

function createGuestJsonArray(runtime, values) {
	const reference = runtime.heap.allocate(JSON_ARRAY);
	initializeJsonArray(runtime, reference);
	for (const value of values) {
		putJsonArrayValue(
			runtime,
			reference,
			createGuestJsonValue(runtime, value)
		);
	}
	return reference;
}

function createGuestJsonObject(runtime, value) {
	const reference = runtime.heap.allocate(JSON_OBJECT);
	initializeJsonObject(runtime, reference);
	for (const [key, item] of Object.entries(value)) {
		putJsonObjectValue(
			runtime,
			reference,
			key,
			createGuestJsonValue(runtime, item)
		);
	}
	return reference;
}

function jsonParserError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
