//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file api-manifest.test.mjs
 * @description Proves API v3.4 discovery is deeply immutable, catalog-driven, compatibility-safe, and explicit about semantic quality, UI discovery, and focused asset/network evidence.
 * The Awtsmoos renews every public letter before command, preference, asset, or feature can freeze its finite sign;
 * Awtsmoos.com lets Binah test one covenant while Chochmah reveals discovery separately, keeping simple calls and deeper transport evidence aligned.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { TEMPLE_ACTIONS } from "../src/api/TempleActionCatalog.js";
import { TEMPLE_PREFERENCES } from "../src/api/TemplePreferenceCatalog.js";
import {
	TEMPLE_API_CAPABILITIES,
	TEMPLE_API_MANIFEST
} from "../src/api/TempleApiManifest.js";

/**
 * @description Proves stable command order plus the v3.4 read, preference, asset-evidence, retry, mobile, quality, and Core-native discovery vocabulary.
 * @returns {void}
 */
function verifyCompatibilityCovenant() {
	assert.equal(TEMPLE_API_MANIFEST.version, "3.4.0");
	assert.deepEqual(TEMPLE_API_CAPABILITIES.commands, [
		"left",
		"right",
		"jump",
		"slide",
		"pause",
		"resume",
		"restart"
	]);
	assert.deepEqual(TEMPLE_API_CAPABILITIES.reads, [
		"state",
		"presentation",
		"ui",
		"diagnostics",
		"assets",
		"preferences"
	]);
	assert.deepEqual(TEMPLE_API_CAPABILITIES.preferences, [
		"fx",
		"reducedMotion",
		"controls",
		"hudDensity",
		"qualityProfile"
	]);
	assert.equal(TEMPLE_API_CAPABILITIES.assetEvidence, true);
	assert.equal(TEMPLE_API_CAPABILITIES.boundedModelRetry, true);
	assert.equal(TEMPLE_API_CAPABILITIES.catalogDrivenUi, true);
	assert.equal(TEMPLE_API_CAPABILITIES.mobileBottomSheet, true);
	assert.equal(TEMPLE_API_CAPABILITIES.qualityProfiles, true);
	assert.equal(TEMPLE_API_CAPABILITIES.proceduralCoreOnly, true);
}

/**
 * @description Proves every nested manifest/capability branch exposed to callers remains deeply frozen, including quality-option vocabulary.
 * @returns {void}
 */
function verifyDeepCovenantFreeze() {
	for (const branch of [
		TEMPLE_API_MANIFEST,
		TEMPLE_API_MANIFEST.configuration,
		TEMPLE_API_MANIFEST.aliases,
		TEMPLE_API_MANIFEST.reads,
		TEMPLE_API_CAPABILITIES,
		TEMPLE_API_CAPABILITIES.preferenceSchema,
		TEMPLE_API_CAPABILITIES.preferenceSchema.qualityProfile.options
	]) {
		assert.equal(Object.isFrozen(branch), true);
	}
}

/**
 * @description Proves manifest entries remain derived from shared action/preference vocabulary while v3.4 asset reads and aliases agree on one canonical channel.
 * @returns {void}
 */
function verifyCatalogAlignment() {
	assert.equal(TEMPLE_API_MANIFEST.commands.slide.intent, TEMPLE_ACTIONS.slide.inputIntent);
	assert.equal(TEMPLE_API_MANIFEST.commands.pause.requiredStatus, "running");
	assert.equal(
		TEMPLE_API_MANIFEST.configuration.qualityProfile.type,
		TEMPLE_PREFERENCES.qualityProfile.type
	);
	assert.deepEqual(
		TEMPLE_API_MANIFEST.configuration.qualityProfile.options,
		["auto", "battery", "balanced", "quality"]
	);
	assert.equal(TEMPLE_API_MANIFEST.reads.ui.source, "ui");
	assert.equal(TEMPLE_API_MANIFEST.reads.assets.source, "assets");
	assert.equal(TEMPLE_API_MANIFEST.aliases.getUi.target, "ui");
	assert.equal(TEMPLE_API_MANIFEST.aliases.getAssets.target, "assets");
	assert.equal(TEMPLE_API_MANIFEST.aliases.setQualityProfile.target, "qualityProfile");
}

test("API v3.4 discovery includes asset evidence and bounded retry", verifyCompatibilityCovenant);
test("API v3.4 covenant is deeply immutable", verifyDeepCovenantFreeze);
test("manifest assets and quality channels align with shared catalogs", verifyCatalogAlignment);
