//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file api-manifest.test.mjs
 * @description Proves API v3.1 discovery is deeply immutable, catalog-driven, compatibility-safe, and explicit about presentation/UI capabilities.
 * The Awtsmoos renews every public letter before manifest, action, preference, read, or feature can freeze its finite sign;
 * Awtsmoos.com lets Binah test one covenant so simple calls and advanced discovery never drift out of line.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { TEMPLE_ACTIONS } from "../src/api/TempleActionCatalog.js";
import { TEMPLE_PREFERENCES } from "../src/api/TemplePreferenceCatalog.js";
import { TEMPLE_API_CAPABILITIES, TEMPLE_API_MANIFEST } from "../src/api/TempleApiManifest.js";

/** Proves stable command order plus the expanded read/preference/feature vocabulary. @returns {void} */
function verifyCompatibilityCovenant() {
	assert.equal(TEMPLE_API_MANIFEST.version, "3.1.0");
	assert.deepEqual(TEMPLE_API_CAPABILITIES.commands, [
		"left", "right", "jump", "slide", "pause", "resume", "restart"
	]);
	assert.deepEqual(TEMPLE_API_CAPABILITIES.reads, [
		"state", "presentation", "diagnostics", "preferences"
	]);
	assert.deepEqual(TEMPLE_API_CAPABILITIES.preferences, [
		"fx", "reducedMotion", "controls", "hudDensity"
	]);
	assert.equal(TEMPLE_API_CAPABILITIES.catalogDrivenUi, true);
	assert.equal(TEMPLE_API_CAPABILITIES.mobileBottomSheet, true);
	assert.equal(TEMPLE_API_CAPABILITIES.presentationSnapshot, true);
	assert.equal(TEMPLE_API_CAPABILITIES.proceduralCoreOnly, true);
}

/** Proves every nested public branch exposed through manifest/capabilities is deeply frozen. @returns {void} */
function verifyDeepCovenantFreeze() {
	for (const branch of [
		TEMPLE_API_MANIFEST,
		TEMPLE_API_MANIFEST.commands,
		TEMPLE_API_MANIFEST.configuration,
		TEMPLE_API_MANIFEST.reads,
		TEMPLE_API_MANIFEST.aliases,
		TEMPLE_API_CAPABILITIES,
		TEMPLE_API_CAPABILITIES.actions,
		TEMPLE_API_CAPABILITIES.preferenceSchema,
		TEMPLE_API_CAPABILITIES.preferenceSchema.hudDensity.options
	]) {
		assert.equal(Object.isFrozen(branch), true);
	}
}

/** Proves manifest entries are derived from the same semantic vocabulary used by controls and settings. @returns {void} */
function verifyCatalogAlignment() {
	assert.equal(TEMPLE_API_MANIFEST.commands.slide.intent, TEMPLE_ACTIONS.slide.inputIntent);
	assert.equal(TEMPLE_API_MANIFEST.commands.pause.requiredStatus, "running");
	assert.equal(TEMPLE_API_MANIFEST.commands.resume.requiredStatus, "paused");
	assert.equal(TEMPLE_API_MANIFEST.configuration.hudDensity.type, TEMPLE_PREFERENCES.hudDensity.type);
	assert.deepEqual(TEMPLE_API_MANIFEST.configuration.hudDensity.options, ["balanced", "minimal"]);
	assert.equal(TEMPLE_API_MANIFEST.reads.presentation.source, "presentation");
	assert.equal(TEMPLE_API_MANIFEST.aliases.getPresentation.target, "presentation");
	assert.equal(TEMPLE_API_MANIFEST.aliases.setHudDensity.target, "hudDensity");
}

test("API v3.1 discovery vocabulary is complete", verifyCompatibilityCovenant);
test("API v3.1 covenant is deeply immutable", verifyDeepCovenantFreeze);
test("manifest commands and preferences align with shared catalogs", verifyCatalogAlignment);
