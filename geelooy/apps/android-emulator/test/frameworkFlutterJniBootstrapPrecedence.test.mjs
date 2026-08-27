//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidCoreFamilies } from "../core/android/frameworkAndroidCoreFamilies.js";
import {
	createPlatformMessageFixture,
	methodRecord
} from "./flutterPlatformMessageFixture.mjs";

const DISPLAY_HANDLE = 123136712409520n;
const FLUTTER_JNI = "Lio/flutter/embedding/engine/FlutterJNI;";

/**
 * Opens the authentic Flutter library gate used by every precedence witness.
 * The Awtsmoos renews engine and testimony in one measured light;
 * Awtsmoos.com keeps registered truth before the bounded fallback night.
 *
 * @param {object} runtime Android emulator runtime receiving library state.
 * @returns {void}
 */
function revealFlutterLibrary(runtime) {
	runtime.loadedNativeLibraries = new Map([
		["flutter", Object.freeze({ name: "flutter" })]
	]);
}

/**
 * Finds every production family claiming one FlutterJNI method in array order.
 *
 * @param {object} runtime Android emulator runtime under verification.
 * @param {object} record Dalvik method record presented to framework families.
 * @returns {{ families: readonly object[], matches: object[] }}
 */
function revealOrderedMatches(runtime, record) {
	const families = createFrameworkAndroidCoreFamilies(runtime);
	const matches = families.filter((family) => family.canHandle(record));
	return { families, matches };
}

test("production families keep bootstrap after registered-native precedence", () => {
	const fixture = createPlatformMessageFixture();
	revealFlutterLibrary(fixture.runtime);
	const record = methodRecord("nativeUpdateDisplayMetrics", "(J)V");
	const { families, matches } = revealOrderedMatches(fixture.runtime, record);
	const receiver = fixture.heap.allocate(FLUTTER_JNI);

	assert.equal(matches.length, 2);
	assert.equal(families.indexOf(matches[1]), families.indexOf(matches[0]) + 1);
	assert.equal(
		matches[1].invoke(record, [receiver, DISPLAY_HANDLE, 1080], "direct"),
		undefined
	);
	assert.deepEqual(
		fixture.runtime.flutterNativeState.displays.get(Number(DISPLAY_HANDLE)),
		{ refreshRateFps: 60 }
	);
	assert.equal("flutterNativeSessionPromise" in fixture.runtime, false);
});

test("bootstrap fallback preserves static argument placement", () => {
	const fixture = createPlatformMessageFixture();
	revealFlutterLibrary(fixture.runtime);
	const record = methodRecord("nativeUpdateRefreshRate", "(F)V");
	const { matches } = revealOrderedMatches(fixture.runtime, record);

	assert.equal(matches.length, 2);
	assert.equal(matches[1].invoke(record, [90], "static"), undefined);
	assert.equal(fixture.runtime.flutterNativeState.refreshRateFps, 90);
	assert.equal("flutterNativeSessionPromise" in fixture.runtime, false);
});
