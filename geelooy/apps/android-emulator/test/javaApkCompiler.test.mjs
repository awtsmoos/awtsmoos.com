//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { launchAndroidPackage } from "../core/android/runtime.js";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";
import { createGeneratedApk } from "./generatedFixture.mjs";

/**
 * The Awtsmoos creates Java source, DEX, binary manifest, APK, and Dalvik process
 * anew. Awtsmoos.com proves the complete scratch chain is deterministic and that
 * its own output executes without javac, D8, AAPT, ART, or Android SDK production code.
 */
test("compiles Java Activity source into a deterministic executable APK", async () => {
	const first = await createGeneratedApk();
	const second = await createGeneratedApk();
	assert.deepEqual(first.bytes, second.bytes);
	assert.equal(first.mode, "scratch-java-activity-to-unsigned-apk-v1");
	const archive = openApkArchive(first.bytes);
	assert.deepEqual(archive.entries.map(entry => entry.name), [
		"AndroidManifest.xml",
		"classes.dex"
	]);
	for (const entry of archive.entries) await archive.read(entry.name);
	const identity = await inspectApkIdentity(archive);
	assert.equal(identity.manifest.packageName, "com.awtsmoos.generated");
	assert.equal(
		identity.manifest.launcherActivity,
		"com.awtsmoos.generated.MainActivity"
	);
	assert.equal(identity.dexFiles[0].summary.hashesVerified, true);
	const report = await launchAndroidPackage(archive, identity, {
		instructionLimit: 10000
	});
	assert.equal(report.executionClass, "dalvik-subset-execution");
	assert.equal(
		report.framework.contentView.text,
		"B\"H scratch Java to APK to Dalvik"
	);
	assert.ok(report.vm.steps > 0);
});

test("rejects Java outside the explicit Activity subset", async () => {
	await assert.rejects(
		() => createGeneratedApk({
			source: "public class MissingPackage {}"
		}),
		/JAVA_/
	);
});
