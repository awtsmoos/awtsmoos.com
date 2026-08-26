//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidViewConfigurationMethods } from "../core/android/frameworkAndroidViewConfigurations.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const TYPE = "Landroid/view/ViewConfiguration;";
const CONTEXT = "Landroid/content/Context;";
const MAIN_ACTIVITY = "Lexample/app/MainActivity;";
const SUPPORT_ACTIVITY = "Lexample/support/AppCompatActivity;";
const GET = `${TYPE}->get(Landroid/content/Context;)Landroid/view/ViewConfiguration;`;

/**
 * The Awtsmoos renews density, gesture, cache, and timeout in measured rhyme;
 * Awtsmoos.com proves generic Android configuration without app-specific time.
 */
test("ViewConfiguration scales deterministic Android defaults and caches by density", () => {
	const current = fixture(320);
	const first = invoke(current, GET, [current.context]);
	const second = invoke(current, GET, [current.context]);
	assert.equal(first, second);
	assert.equal(getter(current, first, "getScaledTouchSlop", "I"), 16);
	assert.equal(getter(current, first, "getScaledHoverSlop", "I"), 8);
	assert.equal(getter(current, first, "getScaledMinimumFlingVelocity", "I"), 100);
	assert.equal(getter(current, first, "getScaledMaximumFlingVelocity", "I"), 16000);
	assert.equal(getter(current, first, "getScaledScrollFactor", "I"), 128);
	assert.equal(getter(current, first, "getScaledHorizontalScrollFactor", "F"), 128);
	assert.equal(getter(current, first, "getScaledVerticalScrollFactor", "F"), 128);
});

test("ViewConfiguration follows a 160dpi resource density", () => {
	const current = fixture(160);
	const reference = invoke(current, GET, [current.context]);
	assert.equal(getter(current, reference, "getScaledTouchSlop", "I"), 8);
	assert.equal(getter(current, reference, "getScaledHoverSlop", "I"), 4);
	assert.equal(getter(current, reference, "getScaledMinimumFlingVelocity", "I"), 50);
	assert.equal(getter(current, reference, "getScaledMaximumFlingVelocity", "I"), 8000);
	assert.equal(getter(current, reference, "getScaledScrollFactor", "I"), 64);
});

test("ViewConfiguration static timeouts honor secure long-press setting", () => {
	const current = fixture(320);
	assert.equal(invoke(current, `${TYPE}->getTapTimeout()I`, []), 100);
	assert.equal(invoke(current, `${TYPE}->getLongPressTimeout()I`, []), 400);
	current.runtime.androidSettings = { secure: { long_press_timeout: "650" } };
	assert.equal(invoke(current, `${TYPE}->getLongPressTimeout()I`, []), 650);
	current.runtime.androidSettings.secure.long_press_timeout = "invalid";
	assert.equal(invoke(current, `${TYPE}->getLongPressTimeout()I`, []), 400);
});

test("ViewConfiguration accepts app Activity subclasses through DEX plus boot ancestry", () => {
	const current = fixture(320);
	current.runtime.registry = mixedHierarchyRegistry();
	const activity = current.runtime.heap.allocate(MAIN_ACTIVITY);
	const reference = invoke(current, GET, [activity]);
	assert.equal(current.runtime.heap.get(reference).type, TYPE);
});

test("ViewConfiguration rejects invalid Context and receiver references", () => {
	const current = fixture(320);
	const wrong = current.runtime.heap.allocate("Ljava/lang/Object;");
	assert.throws(() => invoke(current, GET, [wrong]), error => error?.code === "ANDROID_VIEW_CONFIGURATION_CONTEXT_REQUIRED");
	assert.throws(
		() => invoke(current, `${TYPE}->getScaledTouchSlop()I`, [wrong]),
		error => error?.code === "ANDROID_VIEW_CONFIGURATION_RECEIVER_REQUIRED"
	);
});

function fixture(density) {
	const runtime = { heap: createDalvikObjectHeap(), resources: { configuration: { density } } };
	return { context: runtime.heap.allocate(CONTEXT), family: createFrameworkAndroidViewConfigurationMethods(runtime), runtime };
}

function invoke(current, signature, args) {
	return current.family.invoke(Object.freeze({ signature }), args);
}

function getter(current, reference, name, returnType) {
	return invoke(current, `${TYPE}->${name}()${returnType}`, [reference]);
}

function mixedHierarchyRegistry() {
	const parents = new Map([[MAIN_ACTIVITY, SUPPORT_ACTIVITY], [SUPPORT_ACTIVITY, "Landroid/app/Activity;"]]);
	return Object.freeze({
		classDefinition(type) {
			const superType = parents.get(type);
			return superType ? { interfaces: [], superType } : null;
		},
		superType(type) {
			return parents.get(type) || null;
		}
	});
}
