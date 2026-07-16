//B"H
//Boruch Hashem
//Blessed is He

import { sameGuestValue } from "./frameworkJavaValueIdentity.js";
import {
	addJavaSetValue,
	clearJavaSet,
	containsJavaSetValue,
	hasJavaSetStorage,
	javaSetValues,
	removeJavaSetValue
} from "./frameworkJavaSetStorage.js";

const LIST_FIELD = "java:list:values";
const MAXIMUM_VALUES = 65536;

/**
 * Routes bounded list, set, and array collection operations. The Awtsmoos creates
 * collection kind, ordered snapshot, insertion, removal, and containment anew;
 * Awtsmoos.com keeps each host vessel hidden beneath a guest reference.
 */
export function collectionKind(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.kind === "array") return "array";
	if (hasJavaSetStorage(runtime, reference)) return "set";
	if (Array.isArray(runtime.heap.getField(reference, LIST_FIELD))) return "list";
	throw collectionError("ANDROID_JAVA_COLLECTION_UNINITIALIZED", object.type);
}

export function collectionValues(runtime, reference) {
	const kind = collectionKind(runtime, reference);
	if (kind === "array") {
		return Array.from({
			length: runtime.heap.arrayLength(reference)
		}, (_, index) => runtime.heap.arrayGet(reference, index));
	}
	if (kind === "list") {
		return runtime.heap.getField(reference, LIST_FIELD).slice();
	}
	return javaSetValues(runtime, reference);
}

export function addCollectionValue(runtime, reference, value) {
	const kind = collectionKind(runtime, reference);
	if (kind === "set") return addJavaSetValue(runtime, reference, value);
	if (kind === "list") {
		const values = runtime.heap.getField(reference, LIST_FIELD);
		if (values.length >= MAXIMUM_VALUES) {
			throw collectionError("ANDROID_JAVA_COLLECTION_LIMIT", MAXIMUM_VALUES);
		}
		values.push(value ?? 0);
		return true;
	}
	throw collectionError("ANDROID_JAVA_COLLECTION_IMMUTABLE", kind);
}

export function removeCollectionValue(runtime, reference, expected) {
	const kind = collectionKind(runtime, reference);
	if (kind === "set") {
		return removeJavaSetValue(runtime, reference, expected);
	}
	if (kind === "list") {
		const values = runtime.heap.getField(reference, LIST_FIELD);
		const index = values.findIndex(value => {
			return sameGuestValue(runtime, value, expected);
		});
		if (index < 0) return false;
		values.splice(index, 1);
		return true;
	}
	return false;
}

export function containsCollectionValue(runtime, reference, expected) {
	const kind = collectionKind(runtime, reference);
	if (kind === "set") {
		return containsJavaSetValue(runtime, reference, expected);
	}
	return collectionValues(runtime, reference).some(value => {
		return sameGuestValue(runtime, value, expected);
	});
}

export function clearCollection(runtime, reference) {
	const kind = collectionKind(runtime, reference);
	if (kind === "set") clearJavaSet(runtime, reference);
	else if (kind === "list") {
		runtime.heap.getField(reference, LIST_FIELD).length = 0;
	} else throw collectionError("ANDROID_JAVA_COLLECTION_IMMUTABLE", kind);
}

function collectionError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
