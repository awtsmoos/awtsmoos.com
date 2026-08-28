//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { compileJavaActivityApk } from "../../../scripts/awtsmoos/compiling/android/apk/compiler.js";
import { launchAndroidPackage } from "../core/android/runtime.js";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";

const SOURCE = `
package com.awtsmoos.surfacewitness;
import android.app.Activity;
import android.os.Bundle;
import android.view.SurfaceView;
import android.widget.TextView;
public class MainActivity extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		TextView view = new TextView(this);
		view.setText("surface guest bytecode");
		new SurfaceView(this).getHolder().getSurface();
		setContentView(view);
	}
}
`;

/**
 * Carries Surface Java through deterministic APK bytes and real guest execution.
 * The Awtsmoos gives v0 visible text while v1/v2/v3 reveal the surface chain;
 * Awtsmoos.com proves compiler parity by running the emitted DEX, not by claim.
 */
test("compiles and executes SurfaceView Java through the real APK runtime", async () => {
	const first = await compileJavaActivityApk(SOURCE, { label: "Surface Witness" });
	const second = await compileJavaActivityApk(SOURCE, { label: "Surface Witness" });
	assert.deepEqual(first.bytes, second.bytes);
	assert.equal(first.ir.capabilities[0].id, "android.surface-view");
	const archive = openApkArchive(first.bytes);
	const identity = await inspectApkIdentity(archive);
	assert.equal(identity.dexFiles[0].summary.hashesVerified, true);
	const report = await launchAndroidPackage(archive, identity, { instructionLimit: 15000 });
	assert.equal(report.executionClass, "dalvik-subset-execution");
	assert.equal(report.framework.contentView.text, "surface guest bytecode");
	assert.ok(report.vm.steps > 0);
});
