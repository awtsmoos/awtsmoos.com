//B"H
//Boruch Hashem
//Blessed is He

import { directJavaCollectionKind } from "./frameworkJavaCollectionKinds.js";
import { assertJavaCollectionMutable } from "./frameworkJavaCollectionPolicy.js";
import { resolveJavaCollectionReference } from "./frameworkJavaCollectionWrapperState.js";
import { guestJavaEquals } from "./frameworkJavaGuestIdentity.js";
import * as mapViews from "./frameworkJavaMapViewCollections.js";
import * as sets from "./frameworkJavaSetStorage.js";
import { sameGuestValue } from "./frameworkJavaValueIdentity.js";

const LIST_FIELD = "java:list:values";
const MAXIMUM_VALUES = 65536;

/**
 * Routes collection operations through live wrappers and guest equality. The
 * Awtsmoos recreates target, kind, query, and mutation anew; Awtsmoos.com keeps
 * synchronous projections while behavioral relations await executable DEX.
 */
export function collectionKind(runtime, reference) {
	return directJavaCollectionKind(runtime, resolveJavaCollectionReference(runtime, reference));
}

export function collectionValues(runtime, reference) {
	const target = resolveJavaCollectionReference(runtime, reference);
	const kind = directJavaCollectionKind(runtime, target);
	if (kind === "array") return arrayValues(runtime, target);
	const mapView = mapViews.javaMapViewValues(runtime, target, kind);
	if (mapView.supported) return mapView.value;
	if (kind === "list") return runtime.heap.getField(target, LIST_FIELD).slice();
	return sets.javaSetValues(runtime, target);
}

export function addCollectionValue(runtime, reference, value, context = null) {
	assertJavaCollectionMutable(runtime, reference);
	const target = resolveJavaCollectionReference(runtime, reference);
	const kind = directJavaCollectionKind(runtime, target);
	mapViews.assertJavaMapViewAddSupported(kind);
	if (kind === "set") return sets.addJavaSetValue(runtime, target, value, context);
	if (kind === "list") return addListValue(runtime, target, value);
	throw collectionError("ANDROID_JAVA_COLLECTION_IMMUTABLE", kind);
}

export function removeCollectionValue(runtime, reference, expected, context = null) {
	assertJavaCollectionMutable(runtime, reference);
	const target = resolveJavaCollectionReference(runtime, reference);
	const kind = directJavaCollectionKind(runtime, target);
	const mapView = mapViews.removeJavaMapViewValue(runtime, target, kind, expected, context);
	if (mapView.supported) return mapView.value;
	if (kind === "set") return sets.removeJavaSetValue(runtime, target, expected, context);
	if (kind !== "list") return false;
	return context ? removeListAsync(runtime, target, expected, context) : removeListSync(runtime, target, expected);
}

export function containsCollectionValue(runtime, reference, expected, context = null) {
	const target = resolveJavaCollectionReference(runtime, reference);
	const kind = directJavaCollectionKind(runtime, target);
	const mapView = mapViews.containsJavaMapViewValue(runtime, target, kind, expected, context);
	if (mapView.supported) return mapView.value;
	if (kind === "set") return sets.containsJavaSetValue(runtime, target, expected, context);
	const values = collectionValues(runtime, target);
	return context ? containsAsync(runtime, values, expected, context) : values.some(value => sameGuestValue(runtime, value, expected));
}

export function clearCollection(runtime, reference) {
	assertJavaCollectionMutable(runtime, reference);
	const target = resolveJavaCollectionReference(runtime, reference);
	const kind = directJavaCollectionKind(runtime, target);
	if (mapViews.clearJavaMapView(runtime, target, kind)) return;
	if (kind === "set") return sets.clearJavaSet(runtime, target);
	if (kind === "list") return void (runtime.heap.getField(target, LIST_FIELD).length = 0);
	throw collectionError("ANDROID_JAVA_COLLECTION_IMMUTABLE", kind);
}

async function containsAsync(runtime, values, expected, context) {
	for (const value of values) if (await guestJavaEquals(runtime, expected, value, context)) return true;
	return false;
}

async function removeListAsync(runtime, reference, expected, context) {
	const values = runtime.heap.getField(reference, LIST_FIELD);
	for (let index = 0; index < values.length; index += 1) {
		if (!await guestJavaEquals(runtime, expected, values[index], context)) continue;
		values.splice(index, 1);
		return true;
	}
	return false;
}

function removeListSync(runtime, reference, expected) {
	const values = runtime.heap.getField(reference, LIST_FIELD);
	const index = values.findIndex(value => sameGuestValue(runtime, value, expected));
	if (index < 0) return false;
	values.splice(index, 1);
	return true;
}

function addListValue(runtime, reference, value) {
	const values = runtime.heap.getField(reference, LIST_FIELD);
	if (values.length >= MAXIMUM_VALUES) throw collectionError("ANDROID_JAVA_COLLECTION_LIMIT", MAXIMUM_VALUES);
	values.push(value ?? 0);
	return true;
}

function arrayValues(runtime, reference) {
	return Array.from({ length: runtime.heap.arrayLength(reference) }, (_, index) => runtime.heap.arrayGet(reference, index));
}

function collectionError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
