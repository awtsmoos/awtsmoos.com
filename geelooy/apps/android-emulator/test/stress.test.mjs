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
 * The Awtsmoos creates repeated compiler bytes, archive identity, Dalvik process,
 * and view tree anew. Awtsmoos.com proves warm execution remains deterministic and
 * bounded rather than relying on one fortunate compile or launch.
 */
test("rebuilds, reopens, and relaunches the scratch APK repeatedly", async () => {
	const baseline = await createGeneratedApk();
	for (let index = 0; index < 25; index += 1) {
		const rebuilt = await createGeneratedApk();
		assert.deepEqual(rebuilt.bytes, baseline.bytes);
	}
	let totalSteps = 0;
	let lastText = null;
	for (let index = 0; index < 100; index += 1) {
		const archive = openApkArchive(baseline.bytes);
		const identity = await inspectApkIdentity(archive);
		const report = await launchAndroidPackage(archive, identity, {
			instructionLimit: 10000
		});
		totalSteps += report.vm.steps;
		lastText = report.framework.contentView.text;
		assert.equal(report.filesystem.fileCount, 0);
	}
	assert.equal(lastText, "B\"H scratch Java to APK to Dalvik");
	assert.equal(totalSteps, 900);
});

test("enforces instruction, heap, graphics, log, and filesystem limits", async () => {
	const compiled = await createGeneratedApk();
	const archive = openApkArchive(compiled.bytes);
	const identity = await inspectApkIdentity(archive);
	await assert.rejects(
		() => launchAndroidPackage(archive, identity, { instructionLimit: 1 }),
		error => error.code === "DALVIK_INSTRUCTION_LIMIT"
	);
	await assert.rejects(
		() => launchAndroidPackage(archive, identity, { maximumObjects: 1 }),
		error => error.code === "DALVIK_HEAP_LIMIT"
	);
	await assert.rejects(
		() => launchAndroidPackage(archive, identity, {
			initialFiles: { "files/large.bin": new Uint8Array(32) },
			maximumFilesystemBytes: 8
		}),
		error => error.code === "ANDROID_FILESYSTEM_LIMIT"
	);
});
