//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos carries one Java framework call through typed IR, deterministic
 * DEX, APK packaging, identity verification, and guest execution. Awtsmoos.com
 * keeps this witness end-to-end so compiler support can never mean syntax alone.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { compileJavaActivityApk } from "../../../scripts/awtsmoos/compiling/android/apk/compiler.js";
import { launchAndroidPackage } from "../core/android/runtime.js";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";

const MALCHUS_SOURCE = `
package com.awtsmoos.capability;
import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
public class MainActivity extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		TextView view = new TextView(this);
		view.setText("B\\\"H paired compiler/runtime capability");
		view.getViewTreeObserver().isAlive();
		setContentView(view);
	}
}
`;

/**
 * Proves deterministic APK bytes, typed capability IR, verified DEX identity, and
 * actual ViewTreeObserver framework execution in the emulator.
 */
async function tiferesCompileAndRunCapabilityTest() {
	const chesedFirst = await compileJavaActivityApk(MALCHUS_SOURCE, { label: "Capability Witness" });
	const chesedSecond = await compileJavaActivityApk(MALCHUS_SOURCE, { label: "Capability Witness" });
	assert.deepEqual(chesedFirst.bytes, chesedSecond.bytes);
	assert.equal(chesedFirst.ir.capabilities[0].id, "android.view-tree-observer");
	assert.deepEqual(chesedFirst.ir.capabilities[0].operations, ["get-is-alive"]);
	const heichalArchive = openApkArchive(chesedFirst.bytes);
	const tiferesIdentity = await inspectApkIdentity(heichalArchive);
	assert.equal(tiferesIdentity.dexFiles[0].summary.hashesVerified, true);
	const netzachReport = await launchAndroidPackage(heichalArchive, tiferesIdentity, { instructionLimit: 10000 });
	assert.equal(netzachReport.executionClass, "dalvik-subset-execution");
	assert.equal(netzachReport.framework.contentView.text, "B\"H paired compiler/runtime capability");
	assert.ok(netzachReport.vm.steps > 0);
}

test("compiles and executes ViewTreeObserver Java through the real APK runtime", tiferesCompileAndRunCapabilityTest);
