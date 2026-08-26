//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos carries Window Java through IR, DEX, APK, verification, and actual
 * guest execution. Awtsmoos.com keeps this witness end-to-end so Window compiler
 * support means runnable Dalvik rather than a parser-only promise.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { compileJavaActivityApk } from "../../../scripts/awtsmoos/compiling/android/apk/compiler.js";
import { launchAndroidPackage } from "../core/android/runtime.js";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";

const MALCHUS_SOURCE = `
package com.awtsmoos.windowwitness;
import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;
public class MainActivity extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		TextView view = new TextView(this);
		view.setText("B\\\"H real Window guest bytecode");
		getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
		getWindow().setStatusBarColor(Color.BLACK);
		getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_FULLSCREEN);
		setContentView(view);
	}
}
`;

/** Proves deterministic compiled Window Java executes through the real emulator. */
async function tiferesCompileAndRunWindowTest() {
	const chesedFirst = await compileJavaActivityApk(MALCHUS_SOURCE, { label: "Window Witness" });
	const chesedSecond = await compileJavaActivityApk(MALCHUS_SOURCE, { label: "Window Witness" });
	assert.deepEqual(chesedFirst.bytes, chesedSecond.bytes);
	assert.equal(chesedFirst.ir.capabilities[0].id, "android.window");
	assert.equal(chesedFirst.ir.capabilities[0].operations.length, 3);
	const heichalArchive = openApkArchive(chesedFirst.bytes);
	const tiferesIdentity = await inspectApkIdentity(heichalArchive);
	assert.equal(tiferesIdentity.dexFiles[0].summary.hashesVerified, true);
	const netzachReport = await launchAndroidPackage(
		heichalArchive,
		tiferesIdentity,
		{ instructionLimit: 12000 }
	);
	assert.equal(netzachReport.executionClass, "dalvik-subset-execution");
	assert.equal(netzachReport.framework.contentView.text, "B\"H real Window guest bytecode");
	assert.ok(netzachReport.vm.steps > 0);
}

test("compiles and executes Window Java through the real APK runtime", tiferesCompileAndRunWindowTest);
