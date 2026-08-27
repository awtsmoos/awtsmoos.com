//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	applicationLifecycleSignature,
	createFrameworkApplicationMethods
} from "../core/android/frameworkApplications.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const APPLICATION = "Landroid/app/Application;";
const CALLBACK = "Lexample/LifecycleCallback;";

/**
 * Proves exact Application registration over ordered guest references.
 * The Awtsmoos recreates duplicate, removal, invalid boundary, and bounded list
 * anew; Awtsmoos.com never substitutes a host closure for guest callback identity.
 */
test("register preserves order and duplicates", () => {
	const fixture = createFixture();
	fixture.family.invoke(record("register"), [fixture.application, fixture.first]);
	fixture.family.invoke(record("register"), [fixture.application, fixture.second]);
	fixture.family.invoke(record("register"), [fixture.application, fixture.first]);
	assert.deepEqual(fixture.runtime.activityLifecycleCallbacks, [
		fixture.first,
		fixture.second,
		fixture.first
	]);
});

test("unregister removes only the first matching registration", () => {
	const fixture = createFixture();
	fixture.runtime.activityLifecycleCallbacks.push(
		fixture.first,
		fixture.second,
		fixture.first
	);
	fixture.family.invoke(record("unregister"), [
		fixture.application,
		fixture.first
	]);
	assert.deepEqual(fixture.runtime.activityLifecycleCallbacks, [
		fixture.second,
		fixture.first
	]);
});

test("invalid guest callback references fail through the heap", () => {
	const fixture = createFixture();
	assert.throws(
		() => fixture.family.invoke(record("register"), [
			fixture.application,
			{ id: 999, kind: "dalvik-reference" }
		]),
		/DALVIK_REFERENCE_INVALID/
	);
});

test("registration count remains explicitly bounded", () => {
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
		error => error.code === "ANDROID_ACTIVITY_LIFECYCLE_CALLBACK_LIMIT"
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		activityLifecycleCallbacks: [],
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
	return Object.freeze({ signature: applicationLifecycleSignature(name) });
}
