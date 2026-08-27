//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createGuestString } from "../core/android/guestText.js";
import { classForJavaName } from "../core/android/frameworkJavaClassRuntime.js";
import { createDalvikClassValue } from "../core/android/frameworkJavaClassValues.js";
import { queryJavaClassMethod } from "../core/android/frameworkJavaClassMethodQueries.js";
import { createDeclaredJavaField, readJavaReflectField } from "../core/android/frameworkJavaReflectFieldValues.js";
import { readJavaReflectMethod } from "../core/android/frameworkJavaReflectMethodValues.js";
import { ACCESSIBILITY_CHILD_NODE_IDS_FIELD } from "../core/android/frameworkAndroidAccessibilityFields.js";
import {
	ANDROID_ACCESSIBILITY_NODE_INFO,
	ANDROID_ACCESSIBILITY_RECORD,
	ANDROID_LONG_ARRAY,
	createAccessibilityFixture
} from "./fixtures/androidAccessibilityFixture.mjs";

const QUERIES = Object.freeze([
	[ANDROID_ACCESSIBILITY_NODE_INFO, "getSourceNodeId", []],
	[ANDROID_ACCESSIBILITY_NODE_INFO, "getParentNodeId", []],
	[ANDROID_ACCESSIBILITY_NODE_INFO, "getChildId", ["I"]],
	[ANDROID_ACCESSIBILITY_RECORD, "getSourceNodeId", []],
	[ANDROID_LONG_ARRAY, "get", ["I"]]
]);

test("hidden accessibility methods resolve as framework Method handles", () => {
	const fixture = createAccessibilityFixture();
	for (const [owner, name, parameters] of QUERIES) {
		const result = queryJavaClassMethod(
			fixture.runtime,
			"getMethod",
			owner,
			[createDalvikClassValue(owner), createGuestString(fixture.runtime, name), classArray(fixture, parameters)]
		);
		assert.equal(result.handled, true);
		const metadata = readJavaReflectMethod(fixture.runtime, result.value);
		assert.equal(metadata.classType, owner);
		assert.equal(metadata.name, name);
		assert.equal(metadata.targetKind, "framework");
	}
});

test("hidden child field and LongArray class use guest metadata", () => {
	const fixture = createAccessibilityFixture();
	const field = createDeclaredJavaField(
		fixture.runtime,
		ANDROID_ACCESSIBILITY_NODE_INFO,
		"mChildNodeIds"
	);
	const metadata = readJavaReflectField(fixture.runtime, field);
	assert.equal(metadata.signature, ACCESSIBILITY_CHILD_NODE_IDS_FIELD);
	assert.equal(metadata.staticField, false);
	assert.deepEqual(
		classForJavaName(fixture.runtime, "android.util.LongArray"),
		createDalvikClassValue(ANDROID_LONG_ARRAY)
	);
});

function classArray(fixture, descriptors) {
	const array = fixture.heap.allocateArray("[Ljava/lang/Class;", descriptors.length);
	descriptors.forEach((descriptor, index) => {
		fixture.heap.arraySet(array, index, createDalvikClassValue(descriptor));
	});
	return array;
}
