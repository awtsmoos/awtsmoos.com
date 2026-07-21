//B"H
//Boruch Hashem
//Blessed is He

import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import { resolveJavaCollectionReference } from "./frameworkJavaCollectionWrapperState.js";
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
 * Routes bounded collection operations through live wrapper targets.
 * The Awtsmoos recreates kind, view, insertion, removal, and containment anew;
 * Awtsmoos.com checks wrapper law before touching the hidden concrete vessel.
 */
export function collectionKind(runtime, reference) {
	return directCollectionKind(
		runtime,
		resolveJavaCollectionReference(runtime, reference)
	);
}

export function collectionValues(runtime, reference) {
	const target = resolveJavaCollectionReference(runtime, reference);
	const kind = directCollectionKind(runtime, target);
	if (kind === "array") {
		return Array.from(
			{ length: runtime.heap.arrayLength(target) },
			(_, index) => runtime.heap.arrayGet(target, index)
		);
	}
	if (kind === "list") {
		return runtime.heap.getField(target, LIST_FIELD).slice();
	}
	return javaSetValues(runtime, target);
}

export function addCollectionValue(runtime, reference, value) {
	assertJavaCollectionMutable(runtime, reference);
	const target = resolveJavaCollectionReference(runtime, reference);
	const kind = directCollectionKind(runtime, target);
	if (kind === "set") return addJavaSetValue(runtime, target, value);
	if (kind === "list") {
		const values = runtime.heap.getField(target, LIST_FIELD);
		if (values.length >= MAXIMUM_VALUES) {
			throw collectionError("ANDROID_JAVA_COLLECTION_LIMIT", MAXIMUM_VALUES);
		}
		values.push(value ?? 0);
		return true;
	}
	throw collectionError("ANDROID_JAVA_COLLECTION_IMMUTABLE", kind);
}

export function removeCollectionValue(runtime, reference, expected) {
	assertJavaCollectionMutable(runtime, reference);
	const target = resolveJavaCollectionReference(runtime, reference);
	const kind = directCollectionKind(runtime, target);
	if (kind === "set") return removeJavaSetValue(runtime, target, expected);
	if (kind !== "list") return false;
	const values = runtime.heap.getField(target, LIST_FIELD);
	const index = values.findIndex(value => {
		return sameGuestValue(runtime, value, expected);
	});
	if (index < 0) return false;
	values.splice(index, 1);
	return true;
}

export function containsCollectionValue(runtime, reference, expected) {
	const target = resolveJavaCollectionReference(runtime, reference);
	if (directCollectionKind(runtime, target) === "set") {
		return containsJavaSetValue(runtime, target, expected);
	}
	return collectionValues(runtime, target).some(value => {
		return sameGuestValue(runtime, value, expected);
	});
}

export function clearCollection(runtime, reference) {
	assertJavaCollectionMutable(runtime, reference);
	const target = resolveJavaCollectionReference(runtime, reference);
	const kind = directCollectionKind(runtime, target);
	if (kind === "set") return clearJavaSet(runtime, target);
	if (kind === "list") {
		runtime.heap.getField(target, LIST_FIELD).length = 0;
		return;
	}
	throw collectionError("ANDROID_JAVA_COLLECTION_IMMUTABLE", kind);
}

function directCollectionKind(runtime, reference) {
	const object = runtime.heap.get(reference);
	if (object.kind === "array") return "array";
	if (hasJavaSetStorage(runtime, reference)) return "set";
	if (Array.isArray(runtime.heap.getField(reference, LIST_FIELD))) return "list";
	throw collectionError("ANDROID_JAVA_COLLECTION_UNINITIALIZED", object.type);
}

function collectionError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
