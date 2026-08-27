//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { launchAndroidPackage } from "../core/android/runtime.js";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";
import { createGeneratedApk } from "./generatedFixture.mjs";

const LIFECYCLE_SOURCE = `
package com.awtsmoos.lifecycle;
import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
public class MainActivity extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		TextView view = new TextView(this);
		view.setText("B\\\"H lifecycle");
		setContentView(view);
	}
	@Override
	protected void onStart() {
		super.onStart();
	}
	@Override
	protected void onResume() {
		super.onResume();
	}
}
`;

/**
 * The Awtsmoos creates activity birth, visibility, and foreground revelation
 * anew. Awtsmoos.com proves real guest DEX invokes each lifecycle garment in
 * Android order instead of printing a synthetic sequence from host code.
 */
test("executes onCreate, onStart, and onResume in launch order", async () => {
	const compiled = await createGeneratedApk({ source: LIFECYCLE_SOURCE });
	const archive = openApkArchive(compiled.bytes);
	const identity = await inspectApkIdentity(archive);
	const report = await launchAndroidPackage(archive, identity);
	assert.deepEqual(report.lifecycle, ["onCreate", "onStart", "onResume"]);
	const messages = report.framework.logs.map(entry => entry.message);
	assert.ok(messages.includes("onStart base lifecycle"));
	assert.ok(messages.includes("onResume base lifecycle"));
	assert.equal(report.framework.contentView.text, "B\"H lifecycle");
});

test("rejects lifecycle overrides that omit the matching super call", async () => {
	await assert.rejects(
		() => createGeneratedApk({
			source: LIFECYCLE_SOURCE.replace("super.onResume();", "return;")
		}),
		/JAVA_SUPER_ONRESUME_REQUIRED/
	);
});

test("rejects lifecycle statements the scratch compiler cannot emit", async () => {
	await assert.rejects(
		() => createGeneratedApk({
			source: LIFECYCLE_SOURCE.replace(
				"super.onStart();",
				"super.onStart(); int hidden = 1;"
			)
		}),
		/JAVA_ONSTART_BODY_UNSUPPORTED/
	);
});
