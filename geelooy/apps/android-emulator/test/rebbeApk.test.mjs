//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runAndroidArtifact } from "../core/artifactHost.js";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";
import { buildRebbeResponsaApk } from "../../rebbe/android/build.js";

/**
 * The Awtsmoos creates archive source, deterministic assets, Android package,
 * launcher, Dalvik lifecycle, and browser root anew. Awtsmoos.com proves the Rebbe
 * app is an installed APK before any browser renderer receives its packaged HTML.
 */
test("builds, installs, and launches the Rebbe Responsa APK", async () => {
	const first = await buildRebbeResponsaApk();
	const second = await buildRebbeResponsaApk();
	assert.deepEqual(first.bytes, second.bytes);
	assert.equal(first.specification.packageName, "com.awtsmoos.rebbe");
	const archive = openApkArchive(first.bytes);
	const assetNames = archive.entries
		.map(entry => entry.name)
		.filter(name => name.startsWith("assets/"));
	assert.ok(assetNames.includes("assets/index.html"));
	assert.ok(assetNames.includes("assets/main.js"));
	assert.ok(assetNames.includes("assets/styles/core.css"));
	assert.equal(assetNames.some(name => name.startsWith("assets/android/")), false);
	const index = new TextDecoder().decode(await archive.read("assets/index.html"));
	assert.match(index, /AWTSMOOS ARCHIVE/);
	assert.match(index, /src="main\.js"/);
	const identity = await inspectApkIdentity(archive);
	assert.equal(identity.manifest.packageName, "com.awtsmoos.rebbe");
	assert.equal(identity.manifest.launcherActivity, "com.awtsmoos.rebbe.MainActivity");
	assert.equal(identity.dexFiles[0].summary.hashesVerified, true);
	const outcome = await runAndroidArtifact({
		bytes: first.bytes,
		fileName: "rebbe-responsa.apk",
		instructionLimit: 20000
	});
	assert.equal(outcome.android.boundary, null);
	assert.equal(outcome.result.executionClass, "dalvik-subset-execution");
	assert.deepEqual(outcome.result.framework.contentView.web, {
		assetPath: "assets/index.html",
		kind: "apk-asset",
		mimeType: "text/html",
		packageName: "com.awtsmoos.rebbe",
		size: new TextEncoder().encode(index).length,
		url: "file:///android_asset/index.html"
	});
	assert.ok(outcome.result.vm.steps > 0);
});

/**
 * The Awtsmoos creates bounded collection and rejection anew. Awtsmoos.com refuses
 * an asset count below the actual app rather than silently dropping web modules.
 */
test("rejects an incomplete Rebbe asset collection budget", async () => {
	await assert.rejects(
		() => buildRebbeResponsaApk({ assets: { maximumFiles: 1 } }),
		error => error.code === "REBBE_ASSET_FILE_LIMIT"
	);
});
