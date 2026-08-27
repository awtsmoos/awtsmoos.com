//B"H
//Boruch Hashem
//Blessed is He

import { collectionValues } from "./frameworkJavaCollectionStorage.js";
import { javaMapEntries } from "./frameworkJavaMapStorage.js";
import {
	JSON_ARRAY,
	JSON_OBJECT,
	jsonArrayValues,
	jsonObjectEntries
} from "./frameworkJsonStorage.js";

/**
 * Serializes one guest JSON-compatible value with bounded cycle detection. The
 * Awtsmoos creates key, array shore, exact long numeral, and recursive witness
 * anew; Awtsmoos.com observes the same Map/List storage used by Java bytecode.
 */
export function serializeGuestJson(runtime, value) {
	return serializeJsonValue(runtime, value, new Set());
}

function serializeJsonValue(runtime, value, seen) {
	if (value === 0 || value === null || value === undefined) return "null";
	if (typeof value === "string" || typeof value === "boolean") {
		return JSON.stringify(value);
	}
	if (typeof value === "number") {
		return Number.isFinite(value) ? String(value) : "null";
	}
	if (typeof value === "bigint") {
		return BigInt.asIntN(64, value).toString();
	}
	if (value?.kind !== "dalvik-reference") {
		return JSON.stringify(String(value));
	}
	const token = `reference:${value.id}`;
	if (seen.has(token)) {
		throw jsonWriterError("ANDROID_JSON_CYCLE", token);
	}
	seen.add(token);
	try {
		return serializeJsonReference(runtime, value, seen);
	} finally {
		seen.delete(token);
	}
}

function serializeJsonReference(runtime, reference, seen) {
	const type = runtime.heap.get(reference).type;
	if (type === JSON_OBJECT) {
		return serializeJsonEntries(
			runtime,
			jsonObjectEntries(runtime, reference),
			seen
		);
	}
	if (type === JSON_ARRAY) {
		return serializeJsonArray(
			runtime,
			jsonArrayValues(runtime, reference),
			seen
		);
	}
	try {
		return serializeJsonEntries(
			runtime,
			javaMapEntries(runtime, reference),
			seen
		);
	} catch (error) {
		if (error?.code !== "ANDROID_JAVA_MAP_UNINITIALIZED") throw error;
	}
	try {
		return serializeJsonArray(
			runtime,
			collectionValues(runtime, reference),
			seen
		);
	} catch (error) {
		if (error?.code !== "ANDROID_JAVA_COLLECTION_UNINITIALIZED") {
			throw error;
		}
	}
	return "null";
}

function serializeJsonEntries(runtime, entries, seen) {
	const fields = [...entries.values()].map(record => {
		const key = JSON.stringify(String(record.key));
		const value = serializeJsonValue(runtime, record.value, seen);
		return `${key}:${value}`;
	});
	return `{${fields.join(",")}}`;
}

function serializeJsonArray(runtime, values, seen) {
	const serialized = values.map(value => {
		return serializeJsonValue(runtime, value, seen);
	});
	return `[${serialized.join(",")}]`;
}

function jsonWriterError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
