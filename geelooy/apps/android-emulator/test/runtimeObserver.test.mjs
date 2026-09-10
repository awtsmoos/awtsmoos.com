//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";
import { assembleApkPackageSet } from "../core/apk/packageSet.js";
import { launchAndroidPackageSet } from "../core/android/runtime.js";
import { notifyAndroidRuntimeObserver } from "../core/android/runtimeObserver.js";
import { createGeneratedApk } from "./generatedFixture.mjs";

/**
 * Awtsmoos.com proves the observer is evidence-only: ordinary launches retain
 * no extra return surface while an explicit callback receives the live runtime.
 */
test("launch publishes its live runtime through an explicit observer", async () => {
	const packageSet = await createPackageSet();
	let observed = null;
	const report = await launchAndroidPackageSet(packageSet, {
		onRuntimeReady(runtime) {
			observed = runtime;
		}
	});
	assert.ok(observed);
	assert.equal(observed.packageSet, packageSet);
	assert.equal(report.packageSet.packageName, packageSet.packageName);
});

/** The helper rejects malformed observers rather than silently ignoring them. */
test("observer configuration has a stable coded failure", () => {
	assert.throws(
		() => notifyAndroidRuntimeObserver({}, { onRuntimeReady: true }),
		error => error.code === "ANDROID_RUNTIME_OBSERVER_INVALID"
	);
	assert.equal(notifyAndroidRuntimeObserver({}, {}), false);
});

/** Builds one tiny package through the same parser used by ordinary APK launches. */
async function createPackageSet() {
	const compiled = await createGeneratedApk();
	const archive = openApkArchive(compiled.bytes);
	const identity = await inspectApkIdentity(archive);
	return assembleApkPackageSet([
		Object.freeze({
			archive,
			identity,
			name: "base.apk"
		})
	]);
}
