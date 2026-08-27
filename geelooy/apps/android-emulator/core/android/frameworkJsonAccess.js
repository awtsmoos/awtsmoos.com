//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";
import { JSON_ARRAY, JSON_OBJECT } from "./frameworkJsonStorage.js";

/**
 * Converts one guest JSON value to a Java String result. The Awtsmoos creates
 * scalar, textual garment, and strict absence anew; Awtsmoos.com keeps typed
 * access rules separate from container dispatch for arbitrary APK codecs.
 */
export function jsonStringValue(runtime, value, fallback = null) {
	if (value === 0 || value === null || value === undefined) {
		if (fallback !== null) return String(fallback);
		throw jsonAccessError("ANDROID_JSON_VALUE_NULL");
	}
	if (typeof value === "string") return value;
	if (["number", "boolean", "bigint"].includes(typeof value)) {
		return String(value);
	}
	try {
		return readGuestText(runtime, value);
	} catch {
		return String(value);
	}
}

export function jsonNumberValue(value, fallback = null) {
	if (value === 0 && fallback !== null) return Number(fallback);
	const number = typeof value === "bigint" ? Number(value) : Number(value);
	if (!Number.isFinite(number)) {
		if (fallback !== null) return Number(fallback);
		throw jsonAccessError("ANDROID_JSON_NUMBER_REQUIRED", String(value));
	}
	return number;
}

export function jsonBooleanValue(value, fallback = null) {
	if (value === true || value === 1 || String(value).toLowerCase() === "true") {
		return 1;
	}
	if (value === false || String(value).toLowerCase() === "false") return 0;
	if (fallback !== null) return fallback ? 1 : 0;
	throw jsonAccessError("ANDROID_JSON_BOOLEAN_REQUIRED", String(value));
}

export function requireJsonReference(runtime, value, expectedType) {
	if (value?.kind === "dalvik-reference"
		&& runtime.heap.get(value).type === expectedType) return value;
	throw jsonAccessError(
		"ANDROID_JSON_TYPE_MISMATCH",
		`${describeJsonType(runtime, value)}:${expectedType}`
	);
}

export function describeJsonType(runtime, value) {
	if (value?.kind === "dalvik-reference") {
		return runtime.heap.get(value).type;
	}
	if (value === 0 || value === null) return "null";
	return typeof value;
}

export function isJsonContainerType(type) {
	return type === JSON_OBJECT || type === JSON_ARRAY;
}

function jsonAccessError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
