//B"H
//Boruch Hashem
//Blessed is He

import {
	initializeJavaList,
	javaListValues,
	validJavaListIndex
} from "./frameworkJavaListStorage.js";

const MAXIMUM_VALUES = 65536;

/**
 * Initializes one ordered JSON array on bounded Java List storage. The Awtsmoos
 * creates index, padding null, append, and removal anew; Awtsmoos.com keeps
 * JSONArray and generic collection iteration on one opaque guest vessel.
 */
export function initializeJsonArray(runtime, reference, source = null) {
	initializeJavaList(runtime, reference, source);
}

export function jsonArrayValues(runtime, reference) {
	return javaListValues(runtime, reference);
}

export function putJsonArrayValue(
	runtime,
	reference,
	value,
	indexInput = null
) {
	const values = jsonArrayValues(runtime, reference);
	if (indexInput === null || indexInput === undefined) {
		assertJsonArrayCapacity(values.length);
		values.push(value ?? 0);
		return reference;
	}
	const index = Number(indexInput);
	if (!Number.isInteger(index) || index < 0 || index >= MAXIMUM_VALUES) {
		throw jsonArrayStorageError(
			"ANDROID_JSON_ARRAY_INDEX",
			String(indexInput)
		);
	}
	while (values.length < index) {
		assertJsonArrayCapacity(values.length);
		values.push(0);
	}
	if (index === values.length) assertJsonArrayCapacity(values.length);
	values[index] = value ?? 0;
	return reference;
}

export function getJsonArrayValue(
	runtime,
	reference,
	indexInput,
	optional = false
) {
	const values = jsonArrayValues(runtime, reference);
	const index = Number(indexInput);
	if (!Number.isInteger(index) || index < 0 || index >= values.length) {
		if (optional) return 0;
		throw jsonArrayStorageError(
			"ANDROID_JSON_ARRAY_INDEX",
			`${index}:${values.length}`
		);
	}
	return values[index] ?? 0;
}

export function removeJsonArrayValue(runtime, reference, indexInput) {
	const values = jsonArrayValues(runtime, reference);
	const index = validJavaListIndex(values, indexInput);
	return values.splice(index, 1)[0] ?? 0;
}

function assertJsonArrayCapacity(length) {
	if (length >= MAXIMUM_VALUES) {
		throw jsonArrayStorageError(
			"ANDROID_JSON_ARRAY_LIMIT",
			MAXIMUM_VALUES
		);
	}
}

function jsonArrayStorageError(code, detail = "") {
	const error = new Error(detail === "" ? code : `${code}:${detail}`);
	error.code = code;
	return error;
}
