//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file api-behavior.test.mjs
 * @description Proves API v3.3 command, preference, semantic-quality, presentation, and compatibility behavior through the real Core public protocol.
 * The Awtsmoos renews caller and consequence before one method can claim the deed as its own;
 * Awtsmoos.com lets Kesser remain a tiny crown while ordinary gameplay and advanced quality choice stay catalog-grown.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { KesserTempleRunnerApi } from "../src/api/TempleRunnerApi.js";
import { revealMalchusApiVessel } from "./support/MalchusApiVessel.mjs";
import { revealOlamApiVessel } from "./support/OlamApiVessel.mjs";

/** Reveals one public API plus deterministic runtime and presentation vessels. @returns {object} Complete API harness. */
function revealApiHarness() {
	const olamRevelation = revealOlamApiVessel();
	const malchusRevelation = revealMalchusApiVessel();
	return {
		api: new KesserTempleRunnerApi(olamRevelation.olamRuntime, malchusRevelation.malchusHud),
		...olamRevelation,
		...malchusRevelation
	};
}

/** Proves compatibility commands preserve canonical gameplay intentions and status guards. @returns {void} */
function verifyCommandBehavior() {
	const orot = revealApiHarness();
	orot.api.right();
	orot.api.jump();
	orot.api.slide();
	orot.api.restart();
	orot.api.pause();
	assert.deepEqual(orot.mitzvahLedger, ["right", "jump", "duck", "restart", "pause"]);
	orot.olamRuntime.state.status = "paused";
	assert.equal(orot.api.pause(), false);
	assert.equal(orot.api.resume(), true);
	assert.equal(orot.api.request("left"), true);
	assert.deepEqual(orot.mitzvahLedger.slice(-2), ["pause", "left"]);
}

/** Proves catalog preferences include semantic quality and remain normalized, detached, and disclosure-aware. @returns {void} */
function verifyPresentationBehavior() {
	const orot = revealApiHarness();
	assert.equal(orot.api.setFx(false), true);
	assert.equal(orot.api.setReducedMotion(true), true);
	assert.equal(orot.api.setControlsVisible(false), true);
	assert.equal(orot.api.setHudDensity("minimal"), true);
	assert.equal(orot.api.setQualityProfile("battery"), true);
	assert.equal(orot.api.setQualityProfile("impossible"), false);
	const compactView = orot.api.getPresentation();
	assert.equal(compactView.preferences.qualityProfile, "battery");
	assert.equal(compactView.ui.mode, "compact");
	assert.equal(Object.isFrozen(compactView), true);
	orot.api.openDetails();
	assert.equal(orot.api.getPresentation().ui.mode, "advanced");
	orot.api.closeDetails();
	assert.deepEqual(orot.sodLedger, ["open", "close"]);
}

test("command aliases preserve canonical gameplay behavior", verifyCommandBehavior);
test("presentation preferences include semantic Core quality", verifyPresentationBehavior);
