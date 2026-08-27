//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ACCESSIBILITY_PROPERTY_DEFINITIONS } from "../core/android/frameworkAndroidAccessibilityPropertyCatalog.js";
import { ANDROID_RECT, initializeAndroidRect, readAndroidRect } from "../core/android/frameworkAndroidRectValues.js";
import {
	ANDROID_ACCESSIBILITY_NODE_INFO,
	createAccessibilityFixture,
	invokeAccessibility
} from "./fixtures/androidAccessibilityFixture.mjs";

test("all measured property getter setter pairs preserve exact guest values", () => {
	const fixture = createAccessibilityFixture();
	const node = createNode(fixture);
	for (const [index, definition] of ACCESSIBILITY_PROPERTY_DEFINITIONS.entries()) {
		const value = propertyValue(fixture, definition.kind, index);
		invokeAccessibility(
			fixture,
			ANDROID_ACCESSIBILITY_NODE_INFO,
			definition.setter,
			setterDescriptor(definition.kind),
			[node, value]
		);
		const actual = invokeAccessibility(
			fixture,
			ANDROID_ACCESSIBILITY_NODE_INFO,
			definition.getter,
			getterDescriptor(definition.kind),
			[node]
		);
		assert.deepEqual(actual, normalizedValue(definition.kind, value), definition.setter);
	}
});

test("parent and screen bounds copy guest Rect edges without aliasing", () => {
	const fixture = createAccessibilityFixture();
	const node = createNode(fixture);
	for (const area of ["Parent", "Screen"]) {
		const source = fixture.heap.allocate(ANDROID_RECT);
		initializeAndroidRect(fixture.runtime, source, 1, 2, 31, 42);
		invokeAccessibility(
			fixture,
			ANDROID_ACCESSIBILITY_NODE_INFO,
			`setBoundsIn${area}`,
			"(Landroid/graphics/Rect;)V",
			[node, source]
		);
		initializeAndroidRect(fixture.runtime, source, 9, 9, 9, 9);
		const target = fixture.heap.allocate(ANDROID_RECT);
		initializeAndroidRect(fixture.runtime, target);
		invokeAccessibility(
			fixture,
			ANDROID_ACCESSIBILITY_NODE_INFO,
			`getBoundsIn${area}`,
			"(Landroid/graphics/Rect;)V",
			[node, target]
		);
		assert.deepEqual(readAndroidRect(fixture.runtime, target), {
			bottom: 42,
			left: 1,
			right: 31,
			top: 2
		});
	}
});

function createNode(fixture) {
	return invokeAccessibility(
		fixture,
		ANDROID_ACCESSIBILITY_NODE_INFO,
		"obtain",
		"(Landroid/view/View;I)Landroid/view/accessibility/AccessibilityNodeInfo;",
		[fixture.view, 3]
	);
}

function propertyValue(fixture, kind, index) {
	if (kind === "boolean") return index % 2 ? 1 : 0;
	if (kind === "integer") return index + 101;
	return fixture.heap.allocate("Ljava/lang/Object;");
}

function normalizedValue(kind, value) {
	if (kind === "boolean") return value ? 1 : 0;
	if (kind === "integer") return Number(value) | 0;
	return value;
}

function setterDescriptor(kind) {
	if (kind === "boolean") return "(Z)V";
	if (kind === "integer") return "(I)V";
	return "(Ljava/lang/Object;)V";
}

function getterDescriptor(kind) {
	if (kind === "boolean") return "()Z";
	if (kind === "integer") return "()I";
	return "()Ljava/lang/Object;";
}
