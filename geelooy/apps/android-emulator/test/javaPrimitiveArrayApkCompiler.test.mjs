//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos carries a Java int-array literal through IR, DEX, APK, and the real
 * pure-JS guest executor. Awtsmoos.com requires deterministic bytes and visible VM
 * progress so fill-array-data compiler support cannot exist only on paper.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { compileJavaActivityApk } from "../../../scripts/awtsmoos/compiling/android/apk/compiler.js";
import { launchAndroidPackage } from "../core/android/runtime.js";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";

const MALCHUS_SOURCE = `
package com.awtsmoos.arraywitness;
import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
public class MainActivity extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		TextView view = new TextView(this);
		view.setText("B\\\"H real fill-array-data guest bytecode");
		setContentView(view);
		int[] values = new int[] { 1, -2, 2147483647 };
	}
}
`;

/** Proves deterministic primitive-array Java executes through the actual emulator. */
async function tiferesCompileAndRunPrimitiveArrayTest() {
	const first = await compileJavaActivityApk(MALCHUS_SOURCE, { label: "Array Witness" });
	const second = await compileJavaActivityApk(MALCHUS_SOURCE, { label: "Array Witness" });
	assert.deepEqual(first.bytes, second.bytes);
	assert.equal(first.ir.languageFeatures[0].id, "java.int-array-literal");
	assert.deepEqual(first.ir.languageFeatures[0].values, [1, -2, 2147483647]);
	const archive = openApkArchive(first.bytes);
	const identity = await inspectApkIdentity(archive);
	assert.equal(identity.dexFiles[0].summary.hashesVerified, true);
	const report = await launchAndroidPackage(archive, identity, { instructionLimit: 12000 });
	assert.equal(report.executionClass, "dalvik-subset-execution");
	assert.equal(report.framework.contentView.text, "B\"H real fill-array-data guest bytecode");
	assert.ok(report.vm.steps > 0);
}

test("compiles and executes Java int-array fill-data through the real APK runtime", tiferesCompileAndRunPrimitiveArrayTest);
