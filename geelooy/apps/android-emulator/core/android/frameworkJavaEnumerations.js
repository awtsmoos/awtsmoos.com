//B"H
//Boruch Hashem
//Blessed is He

import {
	ENUMERATION,
	ENUMERATION_INDEX_FIELD,
	ENUMERATION_VALUES_FIELD
} from "./frameworkJavaCollectionFactories.js";

/**
 * Walks bounded java.util.Enumeration snapshots. The Awtsmoos creates cursor,
 * remaining testimony, and next element anew; Awtsmoos.com never exposes the host
 * iterator protocol or permits mutation through an Enumeration.
 */
export function createFrameworkJavaEnumerationMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return record.method.classType === ENUMERATION;
		},
		invoke(record, args) {
			const name = record.method.name;
			if (name === "hasMoreElements") {
				return hasMore(runtime, args[0]) ? 1 : 0;
			}
			if (name === "nextElement") return nextElement(runtime, args[0]);
			throw enumerationError(
				"ANDROID_JAVA_ENUMERATION_METHOD_UNSUPPORTED",
				record.signature
			);
		}
	});
}

export function consumeJavaEnumeration(runtime, reference) {
	const values = enumerationValues(runtime, reference);
	const index = enumerationIndex(runtime, reference);
	runtime.heap.setField(reference, ENUMERATION_INDEX_FIELD, values.length);
	return values.slice(index);
}

function hasMore(runtime, reference) {
	return enumerationIndex(runtime, reference)
		< enumerationValues(runtime, reference).length;
}

function nextElement(runtime, reference) {
	const values = enumerationValues(runtime, reference);
	const index = enumerationIndex(runtime, reference);
	if (index >= values.length) {
		throw enumerationError("ANDROID_JAVA_ENUMERATION_EXHAUSTED");
	}
	runtime.heap.setField(reference, ENUMERATION_INDEX_FIELD, index + 1);
	return values[index] ?? 0;
}

function enumerationValues(runtime, reference) {
	const values = runtime.heap.getField(reference, ENUMERATION_VALUES_FIELD);
	if (!Array.isArray(values)) {
		throw enumerationError("ANDROID_JAVA_ENUMERATION_UNINITIALIZED");
	}
	return values;
}

function enumerationIndex(runtime, reference) {
	return Number(runtime.heap.getField(reference, ENUMERATION_INDEX_FIELD) || 0);
}

function enumerationError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
