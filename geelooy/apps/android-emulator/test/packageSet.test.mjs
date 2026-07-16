//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	assembleApkPackageSet,
	inspectApkPackageSet
} from "../core/apk/packageSet.js";
import { createGeneratedApk } from "./generatedFixture.mjs";

/**
 * The Awtsmoos creates base, feature, and configuration garments anew. These
 * tests let Awtsmoos.com prove package-set identity without pretending that
 * validated splits are already installed into every Android runtime layer.
 */
test("inspects one real base APK as an immutable package set", async () => {
	const compiled = await createGeneratedApk();
	const packageSet = await inspectApkPackageSet([
		{ bytes: compiled.bytes, name: "base.apk" }
	]);
	assert.equal(packageSet.packageName, "com.awtsmoos.generated");
	assert.equal(packageSet.base.name, "base.apk");
	assert.equal(packageSet.base.identity.manifest.splitName, null);
	assert.deepEqual(packageSet.splits, []);
	assert.equal(Object.isFrozen(packageSet), true);
});

test("assembles one base, feature split, and targeted configuration split", () => {
	const packageSet = assembleApkPackageSet([
		record("base.apk", null),
		record("feature-search.apk", "feature.search", null, true),
		record("config-en.apk", "config.en", "feature.search")
	]);
	assert.deepEqual(
		packageSet.splits.map(item => item.identity.manifest.splitName),
		["feature.search", "config.en"]
	);
	assert.equal(packageSet.features[0].name, "feature-search.apk");
	assert.equal(packageSet.configurations[0].targetSplitName, "feature.search");
});

test("rejects duplicate splits, version drift, and absent config targets", () => {
	assertCode(
		() => assembleApkPackageSet([
			record("base.apk", null),
			record("first.apk", "feature.search"),
			record("second.apk", "feature.search")
		]),
		"APK_SPLIT_DUPLICATE"
	);
	assertCode(
		() => assembleApkPackageSet([
			record("base.apk", null),
			record("drift.apk", "feature.search", null, true, 10)
		]),
		"APK_SET_VERSION_MISMATCH"
	);
	assertCode(
		() => assembleApkPackageSet([
			record("base.apk", null),
			record("config.apk", "config.en", "missing.feature")
		]),
		"APK_CONFIG_SPLIT_TARGET_MISSING"
	);
});

function record(name, splitName, configForSplit = null, feature = false, versionCode = 9) {
	return Object.freeze({
		archive: Object.freeze({ entries: Object.freeze([]) }),
		identity: Object.freeze({
			manifest: Object.freeze({
				configForSplit,
				isFeatureSplit: feature,
				packageName: "com.awtsmoos.generated",
				splitName,
				versionCode,
				versionName: "9.0"
			})
		}),
		name
	});
}

function assertCode(callback, code) {
	assert.throws(callback, error => error.code === code);
}
