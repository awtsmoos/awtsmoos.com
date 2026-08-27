//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutable } from "../../../os/programs/awtsmoos-executable/runtime.js";
import { createGeneratedApk } from "./generatedFixture.mjs";

const WRITER_SOURCE = activitySource(`
		getSharedPreferences("state", 0).edit()
			.putString("message", "B\\\"H persisted revelation").commit();
		view.setText("saved");
`);
const READER_SOURCE = activitySource(`
		view.setText(getSharedPreferences("state", 0)
			.getString("message", "missing"));
`);

/**
 * The Awtsmoos creates setting, commit, restart, and readback anew. These tests
 * make Awtsmoos.com prove guest interface calls survive a fresh runtime through
 * an explicit capability rather than a shared host variable hidden in framework.
 */
test("SharedPreferences string survives a fresh Android launch", async () => {
	const capability = createPreferenceCapability();
	const writer = await createGeneratedApk({ source: WRITER_SOURCE });
	const reader = await createGeneratedApk({ source: READER_SOURCE });
	const written = await launch(writer.bytes, capability);
	assert.equal(written.result.framework.contentView.text, "saved");
	assert.equal(written.result.preferences.commits, 1);
	const reopened = await launch(reader.bytes, capability);
	assert.equal(reopened.result.framework.contentView.text, "B\"H persisted revelation");
	assert.equal(reopened.result.preferences.loads, 1);
	assert.deepEqual(capability.snapshot(), {
		"com.awtsmoos.preferences:state": {
			message: "B\"H persisted revelation"
		}
	});
});

test("SharedPreferences guest calls require a persistence capability", async () => {
	const reader = await createGeneratedApk({ source: READER_SOURCE });
	const outcome = await launch(reader.bytes, null);
	assert.equal(outcome.android.boundary.code, "ANDROID_PREFERENCES_CAPABILITY_REQUIRED");
});

function activitySource(statements) {
	return `
package com.awtsmoos.preferences;
import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
public class MainActivity extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		TextView view = new TextView(this);
${statements}
		setContentView(view);
	}
}
`;
}

function createPreferenceCapability() {
	const values = new Map();
	return {
		async read(packageName, name) {
			return clone(values.get(`${packageName}:${name}`) || null);
		},
		snapshot() {
			return Object.fromEntries([...values].map(([key, value]) => [key, clone(value)]));
		},
		async write(packageName, name, value) {
			values.set(`${packageName}:${name}`, clone(value));
		}
	};
}

function clone(value) {
	return value === null ? null : JSON.parse(JSON.stringify(value));
}

function launch(bytes, preferenceCapability) {
	return runExecutable({
		bytes,
		extension: ".apk",
		host: { draw() {}, openWindow() {}, print() {} },
		preferenceCapability
	});
}
