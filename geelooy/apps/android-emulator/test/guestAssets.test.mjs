//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { launchAndroidPackageSet } from "../core/android/runtime.js";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";
import { assembleApkPackageSet } from "../core/apk/packageSet.js";
import { buildStoredApk } from "../../../scripts/awtsmoos/compiling/android/apk/zipWriter.js";
import { createGeneratedApk } from "./generatedFixture.mjs";

const ASSET_SOURCE = `
package com.awtsmoos.assets;
import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;
public class MainActivity extends Activity {
	@Override
	protected void onCreate(Bundle state) {
		super.onCreate(state);
		TextView view = new TextView(this);
		view.setText(new String(getAssets().open("message.txt").readAllBytes(), "UTF-8"));
		setContentView(view);
	}
}
`;

/**
 * The Awtsmoos creates a byte hidden in a split and reveals it through genuine
 * guest calls. Awtsmoos.com proves the displayed text came through AssetManager,
 * InputStream, byte-array, and String vessels rather than a host-side shortcut.
 */
test("guest DEX reads and displays a UTF-8 feature-split asset", async () => {
	const packageSet = await createGuestAssetPackageSet();
	const report = await launchAndroidPackageSet(packageSet);
	assert.equal(report.framework.contentView.text, "B\"H split asset revelation");
	const calls = report.vm.calls.map(call => call.signature);
	for (const signature of expectedSignatures()) assert.ok(calls.includes(signature));
	assert.equal(report.content.entries[0].splitName, "feature.assets");
});

test("rejects an asset String expression with an unsupported charset", async () => {
	await assert.rejects(
		() => createGeneratedApk({
			minSdkVersion: 33,
			source: ASSET_SOURCE.replace("UTF-8", "UTF-16")
		}),
		/JAVA_ASSET_CHARSET_UNSUPPORTED/
	);
});

async function createGuestAssetPackageSet() {
	const compiled = await createGeneratedApk({
		minSdkVersion: 33,
		source: ASSET_SOURCE
	});
	const archive = openApkArchive(compiled.bytes);
	const identity = await inspectApkIdentity(archive);
	return assembleApkPackageSet([
		Object.freeze({ archive, identity, name: "base.apk" }),
		featureRecord(identity)
	]);
}

function featureRecord(baseIdentity) {
	const path = "assets/message.txt";
	const built = buildStoredApk([
		Object.freeze({
			bytes: new TextEncoder().encode("B\"H split asset revelation"),
			name: path
		})
	]);
	return Object.freeze({
		archive: openApkArchive(built.bytes),
		identity: Object.freeze({
			...baseIdentity,
			assets: Object.freeze([path]),
			dexFiles: Object.freeze([]),
			manifest: Object.freeze({
				...baseIdentity.manifest,
				isFeatureSplit: true,
				splitName: "feature.assets"
			})
		}),
		name: "feature-assets.apk"
	});
}

function expectedSignatures() {
	return [
		"Landroid/app/Activity;->getAssets()Landroid/content/res/AssetManager;",
		"Landroid/content/res/AssetManager;->open(Ljava/lang/String;)Ljava/io/InputStream;",
		"Ljava/io/InputStream;->readAllBytes()[B",
		"Ljava/lang/String;-><init>([BLjava/lang/String;)V"
	];
}
