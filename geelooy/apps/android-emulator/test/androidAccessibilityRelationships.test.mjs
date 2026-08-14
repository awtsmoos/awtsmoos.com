//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ACCESSIBILITY_CHILD_NODE_IDS_FIELD } from "../core/android/frameworkAndroidAccessibilityFields.js";
import { encodeAndroidAccessibilityNodeId } from "../core/android/frameworkAndroidAccessibilityNodeIds.js";
import {
	ANDROID_ACCESSIBILITY_NODE_INFO,
	ANDROID_ACCESSIBILITY_RECORD,
	ANDROID_LONG_ARRAY,
	createAccessibilityFixture,
	invokeAccessibility
} from "./fixtures/androidAccessibilityFixture.mjs";

test("node source parent and children preserve encoded guest identities", () => {
	const fixture = createAccessibilityFixture();
	const node = invokeAccessibility(
		fixture,
		ANDROID_ACCESSIBILITY_NODE_INFO,
		"obtain",
		"(Landroid/view/View;I)Landroid/view/accessibility/AccessibilityNodeInfo;",
		[fixture.view, 17]
	);
	assert.equal(sourceId(fixture, node), encodeAndroidAccessibilityNodeId(fixture.view, 17));
	const parent = fixture.heap.allocate("Landroid/view/View;");
	invokeAccessibility(
		fixture,
		ANDROID_ACCESSIBILITY_NODE_INFO,
		"setParent",
		"(Landroid/view/View;I)V",
		[node, parent, 4]
	);
	assert.equal(parentId(fixture, node), encodeAndroidAccessibilityNodeId(parent, 4));
	const child = fixture.heap.allocate("Landroid/view/View;");
	invokeAccessibility(
		fixture,
		ANDROID_ACCESSIBILITY_NODE_INFO,
		"addChild",
		"(Landroid/view/View;I)V",
		[node, child, 9]
	);
	assert.equal(childCount(fixture, node), 1);
	const expected = encodeAndroidAccessibilityNodeId(child, 9);
	assert.equal(childId(fixture, node, 0), expected);
	const hidden = fixture.heap.getField(node, ACCESSIBILITY_CHILD_NODE_IDS_FIELD);
	assert.equal(
		invokeAccessibility(fixture, ANDROID_LONG_ARRAY, "get", "(I)J", [hidden, 0]),
		expected
	);
});

test("record source and copied node retain guest testimony", () => {
	const fixture = createAccessibilityFixture();
	const record = fixture.heap.allocate(ANDROID_ACCESSIBILITY_RECORD);
	invokeAccessibility(
		fixture,
		ANDROID_ACCESSIBILITY_RECORD,
		"setSource",
		"(Landroid/view/View;I)V",
		[record, fixture.view, 23]
	);
	assert.equal(sourceId(fixture, record, ANDROID_ACCESSIBILITY_RECORD), encodeAndroidAccessibilityNodeId(fixture.view, 23));
	const node = invokeAccessibility(
		fixture,
		ANDROID_ACCESSIBILITY_NODE_INFO,
		"obtain",
		"(Landroid/view/View;I)Landroid/view/accessibility/AccessibilityNodeInfo;",
		[fixture.view, 8]
	);
	const copy = invokeAccessibility(
		fixture,
		ANDROID_ACCESSIBILITY_NODE_INFO,
		"obtain",
		"(Landroid/view/accessibility/AccessibilityNodeInfo;)Landroid/view/accessibility/AccessibilityNodeInfo;",
		[node]
	);
	assert.notEqual(copy, node);
	assert.equal(sourceId(fixture, copy), sourceId(fixture, node));
});

function sourceId(fixture, reference, owner = ANDROID_ACCESSIBILITY_NODE_INFO) {
	return invokeAccessibility(fixture, owner, "getSourceNodeId", "()J", [reference]);
}

function parentId(fixture, reference) {
	return invokeAccessibility(fixture, ANDROID_ACCESSIBILITY_NODE_INFO, "getParentNodeId", "()J", [reference]);
}

function childCount(fixture, reference) {
	return invokeAccessibility(fixture, ANDROID_ACCESSIBILITY_NODE_INFO, "getChildCount", "()I", [reference]);
}

function childId(fixture, reference, index) {
	return invokeAccessibility(fixture, ANDROID_ACCESSIBILITY_NODE_INFO, "getChildId", "(I)J", [reference, index]);
}
