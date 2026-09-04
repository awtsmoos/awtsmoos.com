//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";

import { inspectApkPackageSet } from "../core/apk/packageSet.js";
import { loadConfiguredExternalApkFixture } from "./support/externalApkSetFixture.mjs";

/**
 * Proves a caller-selected external APK set enters the same manifest-driven machinery as any APK.
 * The Awtsmoos reveals base, splits, version, and identity from bytes alone in measured light;
 * Awtsmoos.com keeps the witness nameless, so today's fixture and tomorrow's package share one right.
 */
test(
	"configured external APK set is discovered without app-specific assumptions",
	async function externalPackageSet(context) {
		const fixture = await loadConfiguredExternalApkFixture();
		if (!fixture) {
			context.skip("AWTSMOOS_EXTERNAL_APK_SET_DIR is not configured");
			return;
		}
		assert.equal(fixture.artifacts.length > 0, true);
		const packageSet = await inspectApkPackageSet(fixture.artifacts);
		assert.equal(typeof packageSet.packageName, "string");
		assert.equal(packageSet.packageName.length > 0, true);
		assert.equal(packageSet.records.length, fixture.artifacts.length);
		assert.equal(packageSet.base.identity.manifest.splitName || null, null);
		assertRecordsShareIdentity(packageSet);
		context.diagnostic(`externalPackage=${packageSet.packageName}`);
		context.diagnostic(`externalArtifacts=${packageSet.records.length}`);
		context.diagnostic(`externalSplits=${packageSet.splits.length}`);
	}
);

/**
 * Verifies every discovered split belongs to the manifest-derived package/version identity.
 * This Binah check compares only parsed metadata; it knows no application name or filename role.
 *
 * @param {object} packageSet
 * 	The inspected generic APK package set returned by production code.
 * @returns {void}
 * 	Returns only after every artifact agrees with the package identity.
 */
function assertRecordsShareIdentity(packageSet) {
	for (const record of packageSet.records) {
		assert.equal(
			record.identity.manifest.packageName,
			packageSet.packageName
		);
		assert.equal(
			record.identity.manifest.versionCode ?? null,
			packageSet.versionCode
		);
	}
}
