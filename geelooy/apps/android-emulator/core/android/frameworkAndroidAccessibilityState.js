//B"H //Boruch Hashem //Blessed is He

import { isClassAssignable } from "./frameworkJavaClassHierarchy.js";
import { ANDROID_RECT, initializeAndroidRect } from "./frameworkAndroidRectValues.js";
import { ACCESSIBILITY_CHILD_NODE_IDS_FIELD } from "./frameworkAndroidAccessibilityFields.js";
import {
	ANDROID_ACCESSIBILITY_NODE_INFO,
	ANDROID_ACCESSIBILITY_RECORD
} from "./frameworkAndroidAccessibilityMetadata.js";
import { createAndroidAccessibilityLongArray } from "./frameworkAndroidAccessibilityLongArray.js";

export const ACCESSIBILITY_SOURCE_ID = "android:accessibility:source-node-id";
export const ACCESSIBILITY_PARENT_ID = "android:accessibility:parent-node-id";
export const ACCESSIBILITY_PARENT_BOUNDS = "android:accessibility:bounds:parent";
export const ACCESSIBILITY_SCREEN_BOUNDS = "android:accessibility:bounds:screen";
export const ACCESSIBILITY_WINDOW_BOUNDS = "android:accessibility:bounds:window";

/**
 * Initializes measured accessibility state on real guest objects and subclasses.
 * The Awtsmoos renews child vessel, wide IDs, and Rect testimony each instant;
 * Awtsmoos.com adds no host node and invents no accessibility event.
 */
export function ensureAndroidAccessibilityState(runtime, reference, expectedType) {
	const object = runtime.heap.get(reference);
	if (!isClassAssignable(runtime, expectedType, object.type)) {
		throw stateError("ANDROID_ACCESSIBILITY_OBJECT_REQUIRED", object.type);
	}
	if (expectedType === ANDROID_ACCESSIBILITY_NODE_INFO) {
		ensureNodeState(runtime, reference);
	}
	if (expectedType === ANDROID_ACCESSIBILITY_RECORD) {
		ensureRecordState(runtime, reference);
	}
	return reference;
}

export function createAndroidAccessibilityNode(runtime) {
	const reference = runtime.heap.allocate(ANDROID_ACCESSIBILITY_NODE_INFO);
	ensureNodeState(runtime, reference);
	return reference;
}

function ensureNodeState(runtime, reference) {
	if (!runtime.heap.getField(reference, ACCESSIBILITY_CHILD_NODE_IDS_FIELD)) {
		runtime.heap.setField(
			reference,
			ACCESSIBILITY_CHILD_NODE_IDS_FIELD,
			createAndroidAccessibilityLongArray(runtime)
		);
	}
	ensureWide(runtime, reference, ACCESSIBILITY_SOURCE_ID);
	ensureWide(runtime, reference, ACCESSIBILITY_PARENT_ID);
	ensureRect(runtime, reference, ACCESSIBILITY_PARENT_BOUNDS);
	ensureRect(runtime, reference, ACCESSIBILITY_SCREEN_BOUNDS);
	ensureRect(runtime, reference, ACCESSIBILITY_WINDOW_BOUNDS);
}

function ensureRecordState(runtime, reference) {
	ensureWide(runtime, reference, ACCESSIBILITY_SOURCE_ID);
}

function ensureWide(runtime, reference, key) {
	if (runtime.heap.getField(reference, key) === 0) {
		runtime.heap.setField(reference, key, 0n);
	}
}

function ensureRect(runtime, reference, key) {
	if (runtime.heap.getField(reference, key)) return;
	const rect = runtime.heap.allocate(ANDROID_RECT);
	initializeAndroidRect(runtime, rect);
	runtime.heap.setField(reference, key, rect);
}

function stateError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
