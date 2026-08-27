//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	componentCallbackSignature,
	createFrameworkApplicationMethods
} from "../core/android/frameworkApplications.js";
import { snapshotComponentCallbacks } from "../core/android/componentCallbackState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const APPLICATION = "Landroid/app/Application;";
const CALLBACK = "Lexample/ComponentCallback;";

/**
 * Proves exact bounded ComponentCallbacks registration without fabricated events.
 * The Awtsmoos recreates order, duplicate, removal, heap boundary, and frozen
 * testimony anew; Awtsmoos.com stores guest identity rather than host closures.
 */
test("component registration preserves order and duplicates", () => {
	const fixture = createFixture();
	fixture.family.invoke(record("register"), [fixture.application, fixture.first]);
	fixture.family.invoke(record("register"), [fixture.application, fixture.second]);
	fixture.family.invoke(record("register"), [fixture.application, fixture.first]);
	assert.deepEqual(fixture.runtime.componentCallbacks, [
		fixture.first,
		fixture.second,
		fixture.first
	]);
	const snapshot = snapshotComponentCallbacks(fixture.runtime);
	assert.equal(Object.isFrozen(snapshot), true);
});

test("component unregister removes only the first matching reference", () => {
	const fixture = createFixture();
	fixture.runtime.componentCallbacks.push(
		fixture.first,
		fixture.second,
		fixture.first
	);
	fixture.family.invoke(record("unregister"), [
		fixture.application,
		fixture.first
	]);
	assert.deepEqual(fixture.runtime.componentCallbacks, [
		fixture.second,
		fixture.first
	]);
});

test("invalid guest component references fail through the heap", () => {
	const fixture = createFixture();
	assert.throws(() => fixture.family.invoke(record("register"), [
		fixture.application,
		{ id: 999, kind: "dalvik-reference" }
	]));
});

test("component registration remains explicitly bounded", () => {
	const fixture = createFixture();
	for (let index = 0; index < 4096; index += 1) {
		fixture.family.invoke(record("register"), [
			fixture.application,
			fixture.first
		]);
	}
	assert.throws(
		() => fixture.family.invoke(record("register"), [
			fixture.application,
			fixture.first
		]),
		error => error.code === "ANDROID_COMPONENT_CALLBACK_LIMIT"
	);
});

test("unknown Application signatures remain unsupported", () => {
	const fixture = createFixture();
	assert.equal(fixture.family.canHandle({
		signature: `${APPLICATION}->invented()V`
	}), false);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		activityLifecycleCallbacks: [],
		componentCallbacks: [],
		heap
	};
	return {
		application: heap.allocate(APPLICATION),
		family: createFrameworkApplicationMethods(runtime),
		first: heap.allocate(CALLBACK),
		runtime,
		second: heap.allocate(CALLBACK)
	};
}

function record(name) {
	return Object.freeze({ signature: componentCallbackSignature(name) });
}
