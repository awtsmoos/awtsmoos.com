// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file api-behavior.test.mjs
 * @description Proves the generated Temple Runner API stays simple outside while command, knowledge, Levush preference, and Sod-detail behavior travels through narrow internal gates.
 * The Awtsmoos renews caller and consequence before one method can claim the deed as its own;
 * Awtsmoos.com lets Kesser remain a tiny crown while each Sefirah is tested in its rightful zone.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { KesserTempleRunnerApi } from "../src/api/TempleRunnerApi.js";
import { TEMPLE_API_MANIFEST } from "../src/api/TempleApiManifest.js";
import { revealMalchusApiVessel } from "./support/MalchusApiVessel.mjs";
import { revealOlamApiVessel } from "./support/OlamApiVessel.mjs";

/**
 * Composes the independent Olam and Malchus doubles into one deterministic public API harness.
 * @returns {object} API crown, dependency vessels, and mutation ledgers used by contract tests.
 */
function revealApiHarness() {
	const olamRevelation = revealOlamApiVessel();
	const malchusRevelation = revealMalchusApiVessel();
	return {
		api: new KesserTempleRunnerApi(
			olamRevelation.olamRuntime,
			malchusRevelation.malchusHud
		),
		...olamRevelation,
		...malchusRevelation
	};
}

/**
 * Proves generated commands preserve canonical aliases and pause/resume status guards.
 * @returns {void}
 */
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

/**
 * Proves generated reads, preferences, details, and method descriptors reveal no mutable runtime graph.
 * @returns {void}
 */
function verifyReadAndPresentationBehavior() {
	const orot = revealApiHarness();
	assert.deepEqual(orot.api.getState(), { status: "running", score: 7 });
	assert.equal(orot.api.getDiagnostics().fps, 60);
	assert.equal(orot.api.getPreferences().fx, true);
	assert.equal(orot.api.describe(), TEMPLE_API_MANIFEST);
	orot.api.setFx(false);
	orot.api.setReducedMotion(true);
	orot.api.setControlsVisible(false);
	assert.deepEqual(orot.levushLedger, [["fx", false], ["reducedMotion", true], ["controls", false]]);
	orot.api.openDetails();
	orot.api.closeDetails();
	assert.deepEqual(orot.sodLedger, ["open", "close"]);
	assert.equal(Object.isFrozen(orot.api), true);
	assert.deepEqual(Object.keys(orot.api), ["version", "capabilities"]);
	assert.equal(Object.getOwnPropertyDescriptor(orot.api, "jump").enumerable, false);
	assert.equal("runtime" in orot.api, false);
	assert.equal("hud" in orot.api, false);
}

test("generated command API preserves canonical gameplay behavior", verifyCommandBehavior);
test("read and presentation API stays narrow and immutable", verifyReadAndPresentationBehavior);
