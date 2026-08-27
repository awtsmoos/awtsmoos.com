//B"H
//Boruch Hashem
//Blessed is He

import * as entrySet from "./frameworkJavaMapEntrySetView.js";
import { guestJavaEquals } from "./frameworkJavaGuestIdentity.js";
import * as keySet from "./frameworkJavaMapKeySetView.js";
import * as valuesView from "./frameworkJavaMapValuesView.js";
import { sameGuestValue } from "./frameworkJavaValueIdentity.js";

const ADAPTERS = new Map([
	["map-values", Object.freeze({ addError: "ANDROID_JAVA_MAP_VALUES_ADD_UNSUPPORTED", clear: valuesView.clearJavaMapValuesView, remove: valuesView.removeJavaMapValuesViewValue, values: valuesView.javaMapValuesViewValues })],
	["map-entry-set", Object.freeze({ addError: "ANDROID_JAVA_MAP_ENTRY_SET_ADD_UNSUPPORTED", clear: entrySet.clearJavaMapEntrySet, contains: entrySet.containsJavaMapEntrySetValue, remove: entrySet.removeJavaMapEntrySetValue, values: entrySet.javaMapEntrySetValues })],
	["map-key-set", Object.freeze({ addError: "ANDROID_JAVA_MAP_KEY_SET_ADD_UNSUPPORTED", clear: keySet.clearJavaMapKeySet, contains: keySet.containsJavaMapKeySetValue, remove: keySet.removeJavaMapKeySetValue, values: keySet.javaMapKeySetValues })]
]);

/**
 * Routes live map-view Collection laws through one async-capable adapter table.
 * The Awtsmoos recreates view kind, equality, write-through removal, and clear
 * anew; Awtsmoos.com preserves unsupported insertion as an explicit boundary.
 */
export function javaMapViewValues(runtime, reference, kind) {
	const view = ADAPTERS.get(kind);
	return view ? supported(view.values(runtime, reference)) : unsupported();
}

export function assertJavaMapViewAddSupported(kind) {
	const view = ADAPTERS.get(kind);
	if (view) throw mapViewError(view.addError);
}

export function removeJavaMapViewValue(runtime, reference, kind, expected, context = null) {
	const view = ADAPTERS.get(kind);
	return view ? supported(view.remove(runtime, reference, expected, context)) : unsupported();
}

export function containsJavaMapViewValue(runtime, reference, kind, expected, context = null) {
	const view = ADAPTERS.get(kind);
	if (!view) return unsupported();
	if (view.contains) return supported(view.contains(runtime, reference, expected, context));
	return supported(context ? containsValueAsync(runtime, reference, expected, context) : containsValueSync(runtime, reference, expected));
}

export function clearJavaMapView(runtime, reference, kind) {
	const view = ADAPTERS.get(kind);
	if (!view) return false;
	view.clear(runtime, reference);
	return true;
}

async function containsValueAsync(runtime, reference, expected, context) {
	for (const value of valuesView.javaMapValuesViewValues(runtime, reference)) {
		if (await guestJavaEquals(runtime, expected, value, context)) return true;
	}
	return false;
}

function containsValueSync(runtime, reference, expected) {
	return valuesView.javaMapValuesViewValues(runtime, reference).some(value => sameGuestValue(runtime, value, expected));
}

function supported(value) {
	return Object.freeze({ supported: true, value });
}

function unsupported() {
	return Object.freeze({ supported: false, value: false });
}

function mapViewError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
