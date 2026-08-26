//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file api-behavior.test.mjs
 * @description Proves API v3.1 command, presentation, preference, detail, detachment, and compatibility behavior through the real Core public protocol.
 * The Awtsmoos renews caller and consequence before one method can claim the deed as its own;
 * Awtsmoos.com lets Kesser remain a tiny crown while detached evidence and guarded configuration flow through their rightful zone.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { KesserTempleRunnerApi } from "../src/api/TempleRunnerApi.js";
import { TEMPLE_API_MANIFEST } from "../src/api/TempleApiManifest.js";
import { revealMalchusApiVessel } from "./support/MalchusApiVessel.mjs";
import { revealOlamApiVessel } from "./support/OlamApiVessel.mjs";

/** @returns {object} Public API plus deterministic runtime/presentation test vessels. */
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

/** Proves preference aliases normalize catalog values and presentation reads reveal drawer state without mutable references. @returns {void} */
function verifyPresentationBehavior() {
	const orot = revealApiHarness();
	assert.equal(orot.api.setFx(false), true);
	assert.equal(orot.api.setReducedMotion(true), true);
	assert.equal(orot.api.setControlsVisible(false), true);
	assert.equal(orot.api.setHudDensity("minimal"), true);
	assert.equal(orot.api.setHudDensity("impossible"), false);
	assert.deepEqual(orot.levushLedger, [
		["fx", false], ["reducedMotion", true], ["controls", false], ["hudDensity", "minimal"]
	]);
	const compactView = orot.api.getPresentation();
	assert.equal(compactView.ui.mode, "compact");
	assert.equal(compactView.preferences.hudDensity, "minimal");
	assert.equal(Object.isFrozen(compactView), true);
	assert.equal(Object.isFrozen(compactView.preferences), true);
	orot.api.openDetails();
	assert.equal(orot.api.getPresentation().ui.mode, "advanced");
	orot.api.closeDetails();
	assert.deepEqual(orot.sodLedger, ["open", "close"]);
}

/** Proves state, diagnostics, manifest discovery, and public facade ownership remain narrow and immutable. @returns {void} */
function verifyReadAndFacadeBehavior() {
	const orot = revealApiHarness();
	assert.deepEqual(orot.api.getState(), { status: "running", score: 7 });
	assert.equal(orot.api.getDiagnostics().fps, 60);
	assert.equal(orot.api.getPreferences().fx, true);
	assert.equal(orot.api.describe(), TEMPLE_API_MANIFEST);
	assert.equal(Object.isFrozen(orot.api), true);
	assert.deepEqual(Object.keys(orot.api), ["version", "capabilities"]);
	assert.equal(Object.getOwnPropertyDescriptor(orot.api, "jump").enumerable, false);
	assert.equal("runtime" in orot.api, false);
	assert.equal("hud" in orot.api, false);
}

test("command aliases preserve canonical gameplay behavior", verifyCommandBehavior);
test("preferences and presentation remain catalog-driven and detached", verifyPresentationBehavior);
test("read API and facade ownership stay narrow", verifyReadAndFacadeBehavior);
