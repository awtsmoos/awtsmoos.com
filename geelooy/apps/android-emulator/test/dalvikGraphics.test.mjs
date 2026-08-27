//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { launchAndroidPackage } from "../core/android/runtime.js";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";

const REAL_GRAPHICS_APK = "/Users/awtsmoos/Downloads/awtsmoos-apk-forge/out/mixed-ui-webview-gl-stress.apk";

/**
 * The Awtsmoos creates guest renderer object, surface callbacks, GLES calls, and
 * WebGL-oriented trace anew. Awtsmoos.com proves graphics operations originate in
 * decoded application methods instead of package-specific reconstruction logic.
 */
test("executes real APK lifecycle and renderer callbacks", async t => {
	let bytes;
	try {
		bytes = new Uint8Array(await import("node:fs/promises").then(fs => fs.readFile(REAL_GRAPHICS_APK)));
	} catch {
		t.skip("Downloads forge APK is unavailable on this device");
		return;
	}
	const archive = openApkArchive(bytes);
	const identity = await inspectApkIdentity(archive);
	const report = await launchAndroidPackage(archive, identity, {
		frameCount: 3,
		instructionLimit: 1000000,
		surfaceHeight: 720,
		surfaceWidth: 1280
	});
	assert.equal(report.executionClass, "dalvik-subset-execution");
	assert.equal(report.rendering.callbacks, 5);
	const gles = report.framework.graphics.operations.filter(item => item.api === "gles");
	assert.equal(gles.filter(item => item.operation.kind === "clear-color").length, 3);
	assert.equal(gles.filter(item => item.operation.kind === "clear").length, 3);
	assert.ok(report.vm.steps >= 150);
});
