//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { launchAndroidPackageSet } from "../core/android/runtime.js";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";
import { assembleApkPackageSet } from "../core/apk/packageSet.js";
import { runExecutable } from "../../../os/programs/awtsmoos-executable/runtime.js";
import { createGeneratedApk } from "./generatedFixture.mjs";

/**
 * The Awtsmoos creates code in base and feature garments anew. These tests make
 * Awtsmoos.com prove that validated split DEX enters the same supervised runtime
 * and OS doorway without claiming resource or native-library split completion.
 */
test("executes launcher code supplied only by a feature split", async () => {
	const packageSet = await createFeatureDexPackageSet();
	const report = await launchAndroidPackageSet(packageSet);
	assert.equal(report.executionClass, "dalvik-subset-execution");
	assert.equal(report.packageSet.splitCount, 1);
	assert.equal(report.packageSet.dexSources[0].splitName, "feature.code");
	assert.equal(report.framework.contentView.text, "B\"H scratch Java to APK to Dalvik");
});

test("routes a validated package set through the Geelooy executable host", async () => {
	const packageSet = await createFeatureDexPackageSet();
	const host = createHost();
	const outcome = await runExecutable({ androidPackageSet: packageSet, host });
	assert.equal(outcome.result.executionClass, "dalvik-subset-execution");
	assert.equal(outcome.android.packageSet.splitCount, 1);
	assert.equal(host.windows.length, 1);
	assert.equal(host.windows[0].body.text, "B\"H scratch Java to APK to Dalvik");
});

async function createFeatureDexPackageSet() {
	const compiled = await createGeneratedApk();
	const archive = openApkArchive(compiled.bytes);
	const identity = await inspectApkIdentity(archive);
	const baseIdentity = Object.freeze({
		...identity,
		dexFiles: Object.freeze([])
	});
	const featureIdentity = Object.freeze({
		...identity,
		manifest: Object.freeze({
			...identity.manifest,
			isFeatureSplit: true,
			splitName: "feature.code"
		})
	});
	return assembleApkPackageSet([
		Object.freeze({ archive, identity: baseIdentity, name: "base.apk" }),
		Object.freeze({ archive, identity: featureIdentity, name: "feature.apk" })
	]);
}

function createHost() {
	return {
		draws: [],
		prints: [],
		windows: [],
		draw(value) {
			this.draws.push(value);
		},
		openWindow(title, body) {
			this.windows.push({ body, title });
		},
		print(value) {
			this.prints.push(String(value));
		}
	};
}
