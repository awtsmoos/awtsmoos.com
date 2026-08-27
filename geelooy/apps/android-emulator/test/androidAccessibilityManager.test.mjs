//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createFrameworkAndroidAccessibilityMethods } from "../core/android/frameworkAndroidAccessibility.js";
import {
	ACCESSIBILITY_MANAGER_ENABLED,
	ACCESSIBILITY_MANAGER_EVENTS,
	ACCESSIBILITY_MANAGER_TOUCH_ENABLED,
	ANDROID_ACCESSIBILITY_MANAGER
} from "../core/android/frameworkAndroidAccessibilityManager.js";
import { androidSystemService } from "../core/android/frameworkAndroidServiceRegistry.js";

const METHODS = Object.freeze([
	["isEnabled", "()Z"],
	["isTouchExplorationEnabled", "()Z"],
	["addAccessibilityStateChangeListener", "(Landroid/view/accessibility/AccessibilityManager$AccessibilityStateChangeListener;)Z"],
	["removeAccessibilityStateChangeListener", "(Landroid/view/accessibility/AccessibilityManager$AccessibilityStateChangeListener;)Z"],
	["addTouchExplorationStateChangeListener", "(Landroid/view/accessibility/AccessibilityManager$TouchExplorationStateChangeListener;)Z"],
	["removeTouchExplorationStateChangeListener", "(Landroid/view/accessibility/AccessibilityManager$TouchExplorationStateChangeListener;)Z"],
	["sendAccessibilityEvent", "(Landroid/view/accessibility/AccessibilityEvent;)V"]
]);

function fixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkAndroidAccessibilityMethods(runtime);
	const manager = androidSystemService(runtime, "accessibility");
	return { family, heap, manager, runtime };
}

test("accessibility service is stable, typed, and initially disabled", () => {
	const value = fixture();
	assert.notEqual(value.manager, 0);
	assert.equal(value.heap.get(value.manager).type, ANDROID_ACCESSIBILITY_MANAGER);
	assert.equal(androidSystemService(value.runtime, "accessibility"), value.manager);
	assert.equal(androidSystemService(value.runtime, "not-a-service"), 0);
	assert.equal(invoke(value, "isEnabled", "()Z"), 0);
	assert.equal(invoke(value, "isTouchExplorationEnabled", "()Z"), 0);
	value.heap.setField(value.manager, ACCESSIBILITY_MANAGER_ENABLED, 1);
	value.heap.setField(value.manager, ACCESSIBILITY_MANAGER_TOUCH_ENABLED, 1);
	assert.equal(invoke(value, "isEnabled", "()Z"), 1);
	assert.equal(invoke(value, "isTouchExplorationEnabled", "()Z"), 1);
});

test("listener identity and event testimony follow the exact guest calls", () => {
	const value = fixture();
	const accessibility = value.heap.allocate("Landroid/view/accessibility/AccessibilityManager$AccessibilityStateChangeListener;");
	const touch = value.heap.allocate("Landroid/view/accessibility/AccessibilityManager$TouchExplorationStateChangeListener;");
	assert.equal(invoke(value, "addAccessibilityStateChangeListener", METHODS[2][1], accessibility), 1);
	assert.equal(invoke(value, "addAccessibilityStateChangeListener", METHODS[2][1], accessibility), 0);
	assert.equal(invoke(value, "removeAccessibilityStateChangeListener", METHODS[3][1], accessibility), 1);
	assert.equal(invoke(value, "removeAccessibilityStateChangeListener", METHODS[3][1], accessibility), 0);
	assert.equal(invoke(value, "addTouchExplorationStateChangeListener", METHODS[4][1], touch), 1);
	assert.equal(invoke(value, "removeTouchExplorationStateChangeListener", METHODS[5][1], touch), 1);
	const event = value.heap.allocate("Landroid/view/accessibility/AccessibilityEvent;");
	assert.equal(invoke(value, "sendAccessibilityEvent", METHODS[6][1], event), 0);
	assert.deepEqual(value.heap.getField(value.manager, ACCESSIBILITY_MANAGER_EVENTS), [event]);
});

test("family claims only the seven measured manager descriptors", () => {
	const value = fixture();
	for (const [name, descriptor] of METHODS) {
		assert.equal(value.family.canHandle(record(name, descriptor)), true);
	}
	assert.equal(value.family.canHandle(record("getEnabledAccessibilityServiceList", "(I)Ljava/util/List;")), false);
	const source = fs.readFileSync(new URL("../core/android/frameworkAndroidAccessibilityManager.js", import.meta.url), "utf8");
	assert.doesNotMatch(source, /Lio\/flutter|LI2\//);
});

function invoke(value, name, descriptor, argument = undefined) {
	const args = argument === undefined ? [value.manager] : [value.manager, argument];
	return value.family.invoke(record(name, descriptor), args);
}

function record(name, descriptor) {
	return Object.freeze({
		method: Object.freeze({ classType: ANDROID_ACCESSIBILITY_MANAGER, descriptor, name }),
		signature: `${ANDROID_ACCESSIBILITY_MANAGER}->${name}${descriptor}`
	});
}
