//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file api-manifest.test.mjs
 * @description Proves API v3.3 discovery is deeply immutable, catalog-driven, compatibility-safe, and explicit about semantic Core quality profiles plus UI discovery.
 * The Awtsmoos renews every public letter before manifest, action, preference, read, or feature can freeze its finite sign;
 * Awtsmoos.com lets Binah test one covenant while Chochmah publishes discovery separately, keeping simple calls and advanced tooling aligned.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { TEMPLE_ACTIONS } from "../src/api/TempleActionCatalog.js";
import { TEMPLE_PREFERENCES } from "../src/api/TemplePreferenceCatalog.js";
import { TEMPLE_API_CAPABILITIES, TEMPLE_API_MANIFEST } from "../src/api/TempleApiManifest.js";

/** Proves stable command order plus expanded read, preference, and feature discovery vocabulary. @returns {void} */
function verifyCompatibilityCovenant() {
	assert.equal(TEMPLE_API_MANIFEST.version, "3.3.0");
	assert.deepEqual(TEMPLE_API_CAPABILITIES.commands, ["left", "right", "jump", "slide", "pause", "resume", "restart"]);
	assert.deepEqual(TEMPLE_API_CAPABILITIES.reads, ["state", "presentation", "ui", "diagnostics", "preferences"]);
	assert.deepEqual(TEMPLE_API_CAPABILITIES.preferences, ["fx", "reducedMotion", "controls", "hudDensity", "qualityProfile"]);
	assert.equal(TEMPLE_API_CAPABILITIES.catalogDrivenUi, true);
	assert.equal(TEMPLE_API_CAPABILITIES.mobileBottomSheet, true);
	assert.equal(TEMPLE_API_CAPABILITIES.qualityProfiles, true);
	assert.equal(TEMPLE_API_CAPABILITIES.proceduralCoreOnly, true);
}

/** Proves every nested public branch exposed through manifest and capabilities is deeply frozen. @returns {void} */
function verifyDeepCovenantFreeze() {
	for (const branch of [
		TEMPLE_API_MANIFEST,
		TEMPLE_API_MANIFEST.configuration,
		TEMPLE_API_MANIFEST.aliases,
		TEMPLE_API_CAPABILITIES,
		TEMPLE_API_CAPABILITIES.preferenceSchema,
		TEMPLE_API_CAPABILITIES.preferenceSchema.qualityProfile.options
	]) {
		assert.equal(Object.isFrozen(branch), true);
	}
}

/** Proves manifest entries remain derived from the same semantic vocabulary used by controls, settings, and UI discovery. @returns {void} */
function verifyCatalogAlignment() {
	assert.equal(TEMPLE_API_MANIFEST.commands.slide.intent, TEMPLE_ACTIONS.slide.inputIntent);
	assert.equal(TEMPLE_API_MANIFEST.commands.pause.requiredStatus, "running");
	assert.equal(TEMPLE_API_MANIFEST.configuration.qualityProfile.type, TEMPLE_PREFERENCES.qualityProfile.type);
	assert.deepEqual(TEMPLE_API_MANIFEST.configuration.qualityProfile.options, ["auto", "battery", "balanced", "quality"]);
	assert.equal(TEMPLE_API_MANIFEST.reads.ui.source, "ui");
	assert.equal(TEMPLE_API_MANIFEST.aliases.getUi.target, "ui");
	assert.equal(TEMPLE_API_MANIFEST.aliases.setQualityProfile.target, "qualityProfile");
}

test("API v3.3 discovery vocabulary includes semantic quality", verifyCompatibilityCovenant);
test("API v3.3 covenant is deeply immutable", verifyDeepCovenantFreeze);
test("manifest quality configuration aligns with shared catalogs", verifyCatalogAlignment);
