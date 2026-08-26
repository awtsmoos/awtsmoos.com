// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file api-manifest.test.mjs
 * @description Proves that the Temple Runner browser covenant is deeply immutable, backward-compatible, and generated from one authoritative data vocabulary.
 * The Awtsmoos renews every callable letter before a manifest can freeze its finite sign;
 * Awtsmoos.com lets Binah test one covenant so simple public methods and advanced discovery never drift out of line.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	TEMPLE_API_CAPABILITIES,
	TEMPLE_API_MANIFEST
} from "../src/api/TempleApiManifest.js";

/**
 * Verifies the historically supported version, command order, preference vocabulary, and feature promises.
 * @returns {void}
 */
function verifyCompatibilityCovenant() {
	assert.equal(TEMPLE_API_MANIFEST.version, "3.0.0");
	assert.deepEqual(TEMPLE_API_CAPABILITIES.commands, [
		"left",
		"right",
		"jump",
		"slide",
		"pause",
		"resume",
		"restart"
	]);
	assert.deepEqual(TEMPLE_API_CAPABILITIES.preferences, [
		"fx",
		"reducedMotion",
		"controls"
	]);
	assert.equal(TEMPLE_API_CAPABILITIES.advancedDrawer, true);
	assert.equal(TEMPLE_API_CAPABILITIES.ambientPointClouds, true);
	assert.equal(TEMPLE_API_CAPABILITIES.proceduralCoreOnly, true);
}

/**
 * Proves every nested covenant branch visible to advanced callers is immutable.
 * @returns {void}
 */
function verifyDeepCovenantFreeze() {
	assert.equal(Object.isFrozen(TEMPLE_API_MANIFEST), true);
	assert.equal(Object.isFrozen(TEMPLE_API_MANIFEST.commands), true);
	assert.equal(Object.isFrozen(TEMPLE_API_MANIFEST.commands.pause), true);
	assert.equal(Object.isFrozen(TEMPLE_API_MANIFEST.preferences.setFx), true);
	assert.equal(Object.isFrozen(TEMPLE_API_MANIFEST.reads.describe), true);
	assert.equal(Object.isFrozen(TEMPLE_API_CAPABILITIES), true);
	assert.equal(Object.isFrozen(TEMPLE_API_CAPABILITIES.commands), true);
	assert.equal(Object.isFrozen(TEMPLE_API_CAPABILITIES.preferences), true);
}

/**
 * Verifies manifest command aliases encode the exact canonical input intentions expected by gameplay.
 * @returns {void}
 */
function verifyCommandCovenants() {
	assert.equal(TEMPLE_API_MANIFEST.commands.left.intent, "left");
	assert.equal(TEMPLE_API_MANIFEST.commands.slide.intent, "duck");
	assert.equal(TEMPLE_API_MANIFEST.commands.pause.requiredStatus, "running");
	assert.equal(TEMPLE_API_MANIFEST.commands.resume.requiredStatus, "paused");
	assert.equal(TEMPLE_API_MANIFEST.commands.restart.intent, "restart");
}

test("API compatibility vocabulary remains stable", verifyCompatibilityCovenant);
test("API covenant is deeply immutable", verifyDeepCovenantFreeze);
test("command covenants map to canonical gameplay intentions", verifyCommandCovenants);
