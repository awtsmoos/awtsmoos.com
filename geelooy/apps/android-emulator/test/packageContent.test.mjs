//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { launchAndroidPackageSet } from "../core/android/runtime.js";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";
import { createPackageContent } from "../core/apk/packageContent.js";
import { assembleApkPackageSet } from "../core/apk/packageSet.js";
import { buildStoredApk } from "../../../scripts/awtsmoos/compiling/android/apk/zipWriter.js";
import { createGeneratedApk } from "./generatedFixture.mjs";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * The Awtsmoos creates base and split content garments anew. These tests make
 * Awtsmoos.com preserve safe lookup, bounded reads, conflict truth, and artifact
 * provenance before Android AssetManager guest methods are claimed.
 */
test("reads real base assets and feature-split assets through one overlay", async () => {
	const packageSet = await createAssetPackageSet();
	const content = createPackageContent(packageSet);
	assert.deepEqual(
		content.list().map(item => item.path),
		["assets/base.txt", "assets/feature.txt"]
	);
	assert.equal(decoder.decode(await content.read("assets/base.txt")), "base revelation");
	assert.equal(decoder.decode(await content.read("assets/feature.txt")), "feature revelation");
	assert.equal(content.metadata("assets/feature.txt").splitName, "feature.assets");
	assert.equal(content.snapshot().entryCount, 2);
	const report = await launchAndroidPackageSet(packageSet);
	assert.equal(report.content.entryCount, 2);
});

test("rejects unsafe paths, oversized reads, and duplicate logical content", async () => {
	const packageSet = await createAssetPackageSet();
	const content = createPackageContent(packageSet, { maximumReadBytes: 4 });
	await assert.rejects(() => content.read("assets/base.txt"), hasCode("APK_CONTENT_READ_LIMIT"));
	assert.throws(() => content.metadata("../base.txt"), hasCode("APK_CONTENT_PATH_INVALID"));
	const duplicate = createFeatureRecord(
		packageSet.base.identity,
		"feature-duplicate.apk",
		"feature.duplicate",
		"assets/base.txt",
		"duplicate"
	);
	assert.throws(
		() => createPackageContent(assembleApkPackageSet([packageSet.base, duplicate])),
		hasCode("APK_CONTENT_CONFLICT")
	);
});

async function createAssetPackageSet() {
	const compiled = await createGeneratedApk({
		assets: { "base.txt": "base revelation" }
	});
	const archive = openApkArchive(compiled.bytes);
	const identity = await inspectApkIdentity(archive);
	return assembleApkPackageSet([
		Object.freeze({ archive, identity, name: "base.apk" }),
		createFeatureRecord(
			identity,
			"feature-assets.apk",
			"feature.assets",
			"assets/feature.txt",
			"feature revelation"
		)
	]);
}

function createFeatureRecord(baseIdentity, artifactName, splitName, path, text) {
	const built = buildStoredApk([
		Object.freeze({ bytes: encoder.encode(text), name: path })
	]);
	const archive = openApkArchive(built.bytes);
	const identity = Object.freeze({
		...baseIdentity,
		assets: Object.freeze(path.startsWith("assets/") ? [path] : []),
		dexFiles: Object.freeze([]),
		manifest: Object.freeze({
			...baseIdentity.manifest,
			isFeatureSplit: true,
			splitName
		}),
		rawResources: Object.freeze(path.startsWith("res/raw/") ? [path] : [])
	});
	return Object.freeze({ archive, identity, name: artifactName });
}

function hasCode(code) {
	return error => error?.code === code;
}
