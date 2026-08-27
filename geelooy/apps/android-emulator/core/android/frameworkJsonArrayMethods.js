//B"H
//Boruch Hashem
//Blessed is He

import { createGuestString, readGuestText } from "./guestText.js";
import { createJavaIterator } from "./frameworkJavaIterators.js";
import {
	jsonBooleanValue,
	jsonNumberValue,
	jsonStringValue,
	requireJsonReference
} from "./frameworkJsonAccess.js";
import {
	parseGuestJson,
	serializeGuestJson,
	wrapGuestJson
} from "./frameworkJsonSerialization.js";
import {
	getJsonArrayValue,
	initializeJsonArray,
	JSON_ARRAY,
	JSON_OBJECT,
	jsonArrayValues,
	putJsonArrayValue,
	removeJsonArrayValue
} from "./frameworkJsonStorage.js";

/**
 * Implements bounded JSONArray construction and access. The Awtsmoos creates
 * index, wrapped value, optional shore, iterator, and serialized testimony anew;
 * Awtsmoos.com keeps ordered JSON and Java List observation on one guest vessel.
 */
export function createFrameworkJsonArrayMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === JSON_ARRAY;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "<init>") return initialize(runtime, record, args);
			if (name === "put") return put(runtime, record, args);
			if (name === "get") return getJsonArrayValue(runtime, args[0], args[1]);
			if (name === "opt") return getJsonArrayValue(runtime, args[0], args[1], true);
			if (name === "getString") return createGuestString(runtime, jsonStringValue(runtime, getJsonArrayValue(runtime, args[0], args[1])));
			if (name === "optString") return optionalString(runtime, args);
			if (["getInt", "getLong", "getDouble"].includes(name)) return numericValue(runtime, args, false);
			if (["optInt", "optLong", "optDouble"].includes(name)) return numericValue(runtime, args, true);
			if (name === "getBoolean") return jsonBooleanValue(getJsonArrayValue(runtime, args[0], args[1]));
			if (name === "optBoolean") return optionalBoolean(runtime, args);
			if (name === "getJSONObject") return requireJsonReference(runtime, getJsonArrayValue(runtime, args[0], args[1]), JSON_OBJECT);
			if (name === "getJSONArray") return requireJsonReference(runtime, getJsonArrayValue(runtime, args[0], args[1]), JSON_ARRAY);
			if (name === "isNull") return getJsonArrayValue(runtime, args[0], args[1], true) === 0 ? 1 : 0;
			if (name === "remove") return removeJsonArrayValue(runtime, args[0], args[1]);
			if (name === "length") return jsonArrayValues(runtime, args[0]).length;
			if (name === "iterator") return createJavaIterator(runtime, args[0]);
			if (name === "toString") return createGuestString(runtime, serializeGuestJson(runtime, args[0]));
			throw jsonArrayError("ANDROID_JSON_ARRAY_METHOD_UNSUPPORTED", record.signature);
		}
	});
}

function initialize(runtime, record, args) {
	initializeJsonArray(runtime, args[0]);
	if (record.method.descriptor.includes("Ljava/util/Collection;")) {
		initializeJsonArray(runtime, args[0], args[1]);
		return;
	}
	if (!record.method.descriptor.includes("Ljava/lang/String;")) return;
	const parsed = parseGuestJson(runtime, readGuestText(runtime, args[1]));
	requireJsonReference(runtime, parsed, JSON_ARRAY);
	jsonArrayValues(runtime, args[0]).push(...jsonArrayValues(runtime, parsed));
}

function put(runtime, record, args) {
	const indexed = record.method.descriptor.startsWith("(I");
	const index = indexed ? args[1] : null;
	const value = indexed ? args[2] : args[1];
	return putJsonArrayValue(
		runtime,
		args[0],
		wrapGuestJson(runtime, value),
		index
	);
}

function optionalString(runtime, args) {
	const value = getJsonArrayValue(runtime, args[0], args[1], true);
	const fallback = args.length > 2 ? readGuestText(runtime, args[2]) : "";
	return createGuestString(runtime, jsonStringValue(runtime, value, fallback));
}

function numericValue(runtime, args, optional) {
	const value = getJsonArrayValue(runtime, args[0], args[1], optional);
	const fallback = optional && args.length > 2 ? args[2] : null;
	return jsonNumberValue(value, fallback);
}

function optionalBoolean(runtime, args) {
	const value = getJsonArrayValue(runtime, args[0], args[1], true);
	return jsonBooleanValue(value, args.length > 2 ? args[2] : 0);
}

function jsonArrayError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
