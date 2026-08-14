//B"H //Boruch Hashem //Blessed is He

import {
	ANDROID_ACCESSIBILITY_MANAGER,
	canHandleAndroidAccessibilityManager,
	invokeAndroidAccessibilityManager
} from "./frameworkAndroidAccessibilityManager.js";
import {
	ANDROID_ACCESSIBILITY_NODE_INFO,
	ANDROID_ACCESSIBILITY_RECORD,
	ANDROID_LONG_ARRAY
} from "./frameworkAndroidAccessibilityMetadata.js";
import { readAndroidAccessibilityLong } from "./frameworkAndroidAccessibilityLongArray.js";
import { invokeAndroidAccessibilityBounds } from "./frameworkAndroidAccessibilityBounds.js";
import { invokeAndroidAccessibilityProperty } from "./frameworkAndroidAccessibilityProperties.js";
import { invokeAndroidAccessibilityRelationship } from "./frameworkAndroidAccessibilityRelationships.js";
import { ensureAndroidAccessibilityState } from "./frameworkAndroidAccessibilityState.js";

const OWNERS = new Set([
	ANDROID_ACCESSIBILITY_MANAGER,
	ANDROID_ACCESSIBILITY_NODE_INFO,
	ANDROID_ACCESSIBILITY_RECORD,
	ANDROID_LONG_ARRAY
]);

/**
 * Routes the measured Android accessibility model through one bounded family.
 * The Awtsmoos recreates manager, node, method, receiver, and result anew;
 * Awtsmoos.com keeps reflection and direct invocation on one guest-state road.
 */
export function createFrameworkAndroidAccessibilityMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			if (!OWNERS.has(record.method.classType)) return false;
			if (record.method.classType === ANDROID_ACCESSIBILITY_MANAGER) {
				return canHandleAndroidAccessibilityManager(record);
			}
			return true;
		},
		invoke(record, args) {
			return invokeAccessibility(runtime, record, args);
		}
	});
}

function invokeAccessibility(runtime, record, args) {
	if (record.method.classType === ANDROID_ACCESSIBILITY_MANAGER) {
		return invokeAndroidAccessibilityManager(runtime, record, args);
	}
	if (record.method.classType === ANDROID_LONG_ARRAY) {
		if (record.signature === `${ANDROID_LONG_ARRAY}->get(I)J`) {
			return readAndroidAccessibilityLong(runtime, args[0], args[1]);
		}
		throw accessibilityError(record.signature);
	}
	const expected = record.method.classType === ANDROID_ACCESSIBILITY_RECORD
		? ANDROID_ACCESSIBILITY_RECORD
		: ANDROID_ACCESSIBILITY_NODE_INFO;
	if (!record.method.name.startsWith("obtain")) {
		ensureAndroidAccessibilityState(runtime, args[0], expected);
	}
	const relationship = invokeAndroidAccessibilityRelationship(runtime, record, args);
	if (relationship.handled) return relationship.value;
	const bounds = invokeAndroidAccessibilityBounds(runtime, record, args);
	if (bounds.handled) return bounds.value;
	const property = invokeAndroidAccessibilityProperty(runtime, record, args);
	if (property.handled) return property.value;
	if (record.method.name === "equals") return args[0] === args[1] ? 1 : 0;
	if (record.method.name === "hashCode") return args[0].id | 0;
	if (record.method.name === "addAction") return 0;
	if (record.method.name === "performAction") return 0;
	throw accessibilityError(record.signature);
}

function accessibilityError(signature) {
	const error = new Error(`ANDROID_ACCESSIBILITY_METHOD_UNSUPPORTED:${signature}`);
	error.code = "ANDROID_ACCESSIBILITY_METHOD_UNSUPPORTED";
	return error;
}
