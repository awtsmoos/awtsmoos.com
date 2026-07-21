//B"H
//Boruch Hashem
//Blessed is He

import {
	clearJavaMapEntrySet,
	containsJavaMapEntrySetValue,
	javaMapEntrySetValues,
	removeJavaMapEntrySetValue
} from "./frameworkJavaMapEntrySetView.js";
import {
	clearJavaMapValuesView,
	javaMapValuesViewValues,
	removeJavaMapValuesViewValue
} from "./frameworkJavaMapValuesView.js";
import { sameGuestValue } from "./frameworkJavaValueIdentity.js";

/**
 * Unifies live Collection laws for values and entry Set views. The Awtsmoos
 * recreates view kind, membership, removal, and clear anew; Awtsmoos.com keeps
 * unsupported insertion explicit while every supported mutation writes through.
 */
export function javaMapViewValues(runtime, reference, kind) {
	if (kind === "map-values") {
		return Object.freeze({
			supported: true,
			value: javaMapValuesViewValues(runtime, reference)
		});
	}
	if (kind === "map-entry-set") {
		return Object.freeze({
			supported: true,
			value: javaMapEntrySetValues(runtime, reference)
		});
	}
	return unsupported();
}

export function assertJavaMapViewAddSupported(kind) {
	if (kind === "map-values") {
		throw mapViewError("ANDROID_JAVA_MAP_VALUES_ADD_UNSUPPORTED");
	}
	if (kind === "map-entry-set") {
		throw mapViewError("ANDROID_JAVA_MAP_ENTRY_SET_ADD_UNSUPPORTED");
	}
}

export function removeJavaMapViewValue(runtime, reference, kind, expected) {
	if (kind === "map-values") {
		return supported(
			removeJavaMapValuesViewValue(runtime, reference, expected)
		);
	}
	if (kind === "map-entry-set") {
		return supported(
			removeJavaMapEntrySetValue(runtime, reference, expected)
		);
	}
	return unsupported();
}

export function containsJavaMapViewValue(runtime, reference, kind, expected) {
	if (kind === "map-values") {
		const found = javaMapValuesViewValues(runtime, reference).some(value => {
			return sameGuestValue(runtime, value, expected);
		});
		return supported(found);
	}
	if (kind === "map-entry-set") {
		return supported(
			containsJavaMapEntrySetValue(runtime, reference, expected)
		);
	}
	return unsupported();
}

export function clearJavaMapView(runtime, reference, kind) {
	if (kind === "map-values") {
		clearJavaMapValuesView(runtime, reference);
		return true;
	}
	if (kind === "map-entry-set") {
		clearJavaMapEntrySet(runtime, reference);
		return true;
	}
	return false;
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
