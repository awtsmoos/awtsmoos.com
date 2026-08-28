//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos carries FragmentManager Java through real DEX references, generic
 * Fragment construction, transaction state, APK packaging, and guest execution.
 * Awtsmoos.com requires deterministic bytes and visible VM progress as the proof.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { compileJavaActivityApk } from "../../../scripts/awtsmoos/compiling/android/apk/compiler.js";
import { launchAndroidPackage } from "../core/android/runtime.js";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";

const MALCHUS_SOURCE = `
package com.awtsmoos.fragmentwitness;
import android.app.Activity;
import android.app.Fragment;
import android.os.Bundle;
import android.widget.TextView;
public class MainActivity extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		TextView view = new TextView(this);
		view.setText("fragment manager guest bytecode");
		getFragmentManager().beginTransaction().add(new Fragment(), "proof").commit();
		getFragmentManager().executePendingTransactions();
		setContentView(view);
	}
}
`;

/** Proves deterministic Fragment compiler output executes in the actual pure-JS guest. */
async function tiferesCompileAndRunFragmentTest() {
	const first = await compileJavaActivityApk(MALCHUS_SOURCE, { label: "Fragment Witness" });
	const second = await compileJavaActivityApk(MALCHUS_SOURCE, { label: "Fragment Witness" });
	assert.deepEqual(first.bytes, second.bytes);
	assert.equal(first.ir.capabilities[0].id, "android.fragment-manager");
	const archive = openApkArchive(first.bytes);
	const identity = await inspectApkIdentity(archive);
	assert.equal(identity.dexFiles[0].summary.hashesVerified, true);
	const report = await launchAndroidPackage(archive, identity, { instructionLimit: 15000 });
	assert.equal(report.executionClass, "dalvik-subset-execution");
	assert.equal(report.framework.contentView.text, "fragment manager guest bytecode");
	assert.ok(report.vm.steps > 0);
}

test("compiles and executes FragmentManager Java through the real APK runtime", tiferesCompileAndRunFragmentTest);
