//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file api-discovery-behavior.test.mjs
 * @description Proves API v3.3 UI discovery, quality schema, diagnostics, live disclosure evidence, deep detachment, and narrow public facade ownership.
 * The Awtsmoos renews hidden knowledge before any tool can call its finite snapshot the source;
 * Awtsmoos.com lets Daas reveal advanced maps without widening Kesser, keeping discovery deep while the public crown remains terse.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { KesserTempleRunnerApi } from "../src/api/TempleRunnerApi.js";
import { TEMPLE_API_MANIFEST } from "../src/api/TempleApiManifest.js";
import { revealMalchusApiVessel } from "./support/MalchusApiVessel.mjs";
import { revealOlamApiVessel } from "./support/OlamApiVessel.mjs";

/** Reveals one API harness dedicated to immutable discovery behavior. @returns {object} Public API plus backing vessels. */
function revealDiscoveryHarness() {
	const olamRevelation = revealOlamApiVessel();
	const malchusRevelation = revealMalchusApiVessel();
	return {
		api: new KesserTempleRunnerApi(olamRevelation.olamRuntime, malchusRevelation.malchusHud),
		...olamRevelation,
		...malchusRevelation
	};
}

/** Proves UI discovery groups actions and reveals quality schema plus live preference/disclosure evidence without DOM access. @returns {void} */
function verifyUiDiscoveryBehavior() {
	const orot = revealDiscoveryHarness();
	const discovery = orot.api.getUi();
	assert.deepEqual(discovery.primaryTouchActions.map((action) => action.id), ["left", "jump", "slide", "right"]);
	assert.deepEqual(discovery.systemActions.map((action) => action.id), ["pause", "restart"]);
	assert.deepEqual(discovery.preferences.qualityProfile.options, ["auto", "battery", "balanced", "quality"]);
	assert.equal(discovery.currentPreferences.qualityProfile, "auto");
	assert.equal(discovery.disclosure.mode, "compact");
	assert.equal(Object.isFrozen(discovery), true);
	orot.api.setQualityProfile("quality");
	orot.api.openDetails();
	const updated = orot.api.getUi();
	assert.equal(updated.currentPreferences.qualityProfile, "quality");
	assert.equal(updated.disclosure.mode, "advanced");
}

/** Proves ordinary evidence channels and public facade ownership remain narrow despite richer discovery. @returns {void} */
function verifyReadAndFacadeBehavior() {
	const orot = revealDiscoveryHarness();
	assert.deepEqual(orot.api.getState(), { status: "running", score: 7 });
	assert.equal(orot.api.getDiagnostics().fps, 60);
	assert.equal(orot.api.getPreferences().qualityProfile, "auto");
	assert.equal(orot.api.describe(), TEMPLE_API_MANIFEST);
	assert.equal(Object.isFrozen(orot.api), true);
	assert.deepEqual(Object.keys(orot.api), ["version", "capabilities"]);
	assert.equal(Object.getOwnPropertyDescriptor(orot.api, "setQualityProfile").enumerable, false);
	assert.equal("runtime" in orot.api, false);
	assert.equal("hud" in orot.api, false);
}

test("UI discovery includes semantic quality and live disclosure evidence", verifyUiDiscoveryBehavior);
test("discovery reads preserve narrow facade ownership", verifyReadAndFacadeBehavior);
