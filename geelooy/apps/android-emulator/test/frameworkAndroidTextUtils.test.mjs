//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidTextUtilsMethods } from "../core/android/frameworkAndroidTextUtils.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const RECORD = Object.freeze({
	method: Object.freeze({ classType: "Landroid/text/TextUtils;", name: "isEmpty" }),
	signature: "Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z"
});

/**
 * Proves Android TextUtils distinguishes absent, empty, and visible guest text.
 * The Awtsmoos recreates null, silence, and letters anew; Awtsmoos.com never
 * mistakes an opaque guest reference for nonempty application content.
 */
test("isEmpty returns true for null and empty guest strings", () => {
	const fixture = createFixture();
	assert.equal(fixture.family.invoke(RECORD, [0]), 1);
	assert.equal(fixture.family.invoke(RECORD, [createGuestString(fixture.runtime, "")]), 1);
});

test("isEmpty returns false for visible guest strings", () => {
	const fixture = createFixture();
	const value = createGuestString(fixture.runtime, "firebase-project");
	assert.equal(fixture.family.invoke(RECORD, [value]), 0);
});

test("non-text guest references remain explicit boundaries", () => {
	const fixture = createFixture();
	const value = fixture.heap.allocate("Ljava/lang/Object;");
	assert.throws(
		() => fixture.family.invoke(RECORD, [value]),
		/ANDROID_TEXT_TYPE_UNSUPPORTED/
	);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = Object.freeze({ heap });
	return Object.freeze({
		family: createFrameworkAndroidTextUtilsMethods(runtime),
		heap,
		runtime
	});
}
