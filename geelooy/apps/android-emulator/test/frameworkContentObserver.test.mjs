//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import {
	ANDROID_CONTENT_OBSERVER,
	CONTENT_OBSERVER_HANDLER_FIELD,
	createFrameworkContentObserverMethods
} from "../core/android/frameworkContentObservers.js";
import { HANDLER } from "../core/android/frameworkAndroidLoopState.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CONSTRUCTOR = `${ANDROID_CONTENT_OBSERVER}-><init>(${HANDLER})V`;
const SUBCLASS = "Lexample/DisplayContentObserver;";

/**
 * Proves ContentObserver construction stores only measured Handler testimony.
 * The Awtsmoos preserves exact subclass, nullable dispatcher, and void return;
 * Awtsmoos.com invents no resolver registration and fires no change callback.
 */
test("ContentObserver constructor stores exact guest Handler", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(SUBCLASS);
	const handler = fixture.heap.allocate(HANDLER);
	assert.equal(fixture.family.invoke(record(), [receiver, handler]), 0);
	assert.equal(fixture.heap.get(receiver).type, SUBCLASS);
	assert.equal(
		fixture.heap.getField(receiver, CONTENT_OBSERVER_HANDLER_FIELD),
		handler
	);
	assert.equal(fixture.heap.getField(receiver, "android:content-observer:registered"), 0);
});

test("ContentObserver constructor preserves guest null Handler", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(SUBCLASS);
	assert.equal(fixture.family.invoke(record(), [receiver, 0]), 0);
	assert.equal(fixture.heap.getField(receiver, CONTENT_OBSERVER_HANDLER_FIELD), 0);
});

test("ContentObserver constructor validation and family routing remain strict", () => {
	const fixture = createFixture();
	const receiver = fixture.heap.allocate(SUBCLASS);
	for (const invalid of [7, fixture.heap.allocate("Ljava/lang/Object;")]) {
		assert.throws(
			() => fixture.family.invoke(record(), [receiver, invalid]),
			error => error.code === "ANDROID_CONTENT_OBSERVER_HANDLER_REQUIRED"
		);
	}
	assert.throws(
		() => fixture.family.invoke(record(), [0, 0]),
		error => error.code === "ANDROID_CONTENT_OBSERVER_RECEIVER_REQUIRED"
	);
	const families = createFrameworkAndroidCoreFamilies(fixture.runtime);
	assert.equal(families.filter(item => item.canHandle(record())).length, 1);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		graphics: { canvas() {} },
		heap,
		logcat: { debug() {}, info() {}, warn() {} },
		views: {
			addChild() {},
			get() { return null; },
			set() {}
		}
	};
	return {
		family: createFrameworkContentObserverMethods(runtime),
		heap,
		runtime
	};
}

function record() {
	return {
		method: {
			classType: ANDROID_CONTENT_OBSERVER,
			descriptor: `(${HANDLER})V`,
			name: "<init>"
		},
		signature: CONSTRUCTOR
	};
}
