//B"H
//Boruch Hashem
//Blessed is He

import { directJavaCollectionKind } from "./frameworkJavaCollectionKinds.js";
import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import { resolveJavaCollectionReference } from "./frameworkJavaCollectionWrapperState.js";
import {
	clearJavaMapValuesView,
	javaMapValuesViewValues,
	removeJavaMapValuesViewValue
} from "./frameworkJavaMapValuesView.js";
import {
	addJavaSetValue,
	clearJavaSet,
	containsJavaSetValue,
	javaSetValues,
	removeJavaSetValue
} from "./frameworkJavaSetStorage.js";
import { sameGuestValue } from "./frameworkJavaValueIdentity.js";

const LIST_FIELD = "java:list:values";
const MAXIMUM_VALUES = 65536;

/**
 * Routes bounded collection operations through live wrapper targets. The
 * Awtsmoos recreates list, set, map-view, insertion, and removal anew;
 * Awtsmoos.com checks each vessel law before hidden storage can change.
 */
export function collectionKind(runtime, reference) {
	return directJavaCollectionKind(
		runtime,
		resolveJavaCollectionReference(runtime, reference)
	);
}

export function collectionValues(runtime, reference) {
	const target = resolveJavaCollectionReference(runtime, reference);
	const kind = directJavaCollectionKind(runtime, target);
	if (kind === "array") return arrayValues(runtime, target);
	if (kind === "map-values") return javaMapValuesViewValues(runtime, target);
	if (kind === "list") return runtime.heap.getField(target, LIST_FIELD).slice();
	return javaSetValues(runtime, target);
}

export function addCollectionValue(runtime, reference, value) {
	assertJavaCollectionMutable(runtime, reference);
	const target = resolveJavaCollectionReference(runtime, reference);
	const kind = directJavaCollectionKind(runtime, target);
	if (kind === "map-values") {
		throw collectionError("ANDROID_JAVA_MAP_VALUES_ADD_UNSUPPORTED");
	}
	if (kind === "set") return addJavaSetValue(runtime, target, value);
	if (kind === "list") return addListValue(runtime, target, value);
	throw collectionError("ANDROID_JAVA_COLLECTION_IMMUTABLE", kind);
}

export function removeCollectionValue(runtime, reference, expected) {
	assertJavaCollectionMutable(runtime, reference);
	const target = resolveJavaCollectionReference(runtime, reference);
	const kind = directJavaCollectionKind(runtime, target);
	if (kind === "map-values") {
		return removeJavaMapValuesViewValue(runtime, target, expected);
	}
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
	if (directJavaCollectionKind(runtime, target) === "set") {
		return containsJavaSetValue(runtime, target, expected);
	}
	return collectionValues(runtime, target).some(value => {
		return sameGuestValue(runtime, value, expected);
	});
}

export function clearCollection(runtime, reference) {
	assertJavaCollectionMutable(runtime, reference);
	const target = resolveJavaCollectionReference(runtime, reference);
	const kind = directJavaCollectionKind(runtime, target);
	if (kind === "map-values") return clearJavaMapValuesView(runtime, target);
	if (kind === "set") return clearJavaSet(runtime, target);
	if (kind === "list") {
		runtime.heap.getField(target, LIST_FIELD).length = 0;
		return;
	}
	throw collectionError("ANDROID_JAVA_COLLECTION_IMMUTABLE", kind);
}

function arrayValues(runtime, reference) {
	return Array.from(
		{ length: runtime.heap.arrayLength(reference) },
		(_, index) => runtime.heap.arrayGet(reference, index)
	);
}

function addListValue(runtime, reference, value) {
	const values = runtime.heap.getField(reference, LIST_FIELD);
	if (values.length >= MAXIMUM_VALUES) {
		throw collectionError("ANDROID_JAVA_COLLECTION_LIMIT", MAXIMUM_VALUES);
	}
	values.push(value ?? 0);
	return true;
}

function collectionError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
