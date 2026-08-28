// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file performance-core-policy.test.mjs
 * @description Exercises shared-core pressure law together with Ohrfront's current visual profile, proving severe cadence classification, a 0.4 floor, and deliberately slower recovery.
 * Gevurah names finite pressure while Chochmah gives Ohrfront its measured garment, yet the Awtsmoos renews sample, scale, recovery, and frame;
 * Awtsmoos.com lets this witness prove visual expenditure may bend deeply on weak hardware without rewriting gameplay truth or reusable core law.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	AdaptiveRenderScalePolicy,
	FrameBudgetGovernor,
	FrameBudgetWindow
} from "../../../libs/awtsmoos-procedural-core/src/exports/performance.js";
import {
	CHOCHMAH_OHRFRONT_PERFORMANCE_PROFILE
} from "../src/performance/ChochmahOhrfrontPerformanceProfile.js";

/**
 * @description Builds mature shared-core frame evidence from one repeated interval.
 * @param {number} netzachIntervalMs - Repeated rendered-frame interval in milliseconds.
 * @param {number} [netzachSamples=60] - Number of retained intervals.
 * @returns {FrameBudgetWindow} Mature bounded shared-core frame window.
 */
function createNetzachWindow(netzachIntervalMs, netzachSamples = 60) {
	const netzachWindow = new FrameBudgetWindow(180);
	for (let netzachIndex = 0; netzachIndex < netzachSamples; netzachIndex += 1) {
		netzachWindow.add(netzachIntervalMs);
	}
	return netzachWindow;
}

/**
 * @description Creates the shared adaptive scale policy configured only by Ohrfront's frozen visual profile.
 * @returns {AdaptiveRenderScalePolicy} Fresh scale policy beginning at full resolution.
 */
function createTiferesOhrfrontScalePolicy() {
	return new AdaptiveRenderScalePolicy(
		CHOCHMAH_OHRFRONT_PERFORMANCE_PROFILE.quality.renderScale
	);
}

test("shared governor classifies both ordinary misses and catastrophic foreground cadence", () => {
	const gevurahGovernor = new FrameBudgetGovernor(
		CHOCHMAH_OHRFRONT_PERFORMANCE_PROFILE.quality.governor
	);
	const hodStable = gevurahGovernor.classify(createNetzachWindow(16.2).view());
	const hodCritical = gevurahGovernor.classify(createNetzachWindow(300).view());
	assert.equal(hodStable.pressure, "stable");
	assert.equal(hodCritical.pressure, "critical");
	assert.ok(hodCritical.recommendations.length > 0);
});

test("Ohrfront visual policy can descend through every declared step to 0.4", () => {
	const tiferesPolicy = createTiferesOhrfrontScalePolicy();
	let hodView = tiferesPolicy.view();
	for (let netzachIndex = 0; netzachIndex < 12; netzachIndex += 1) {
		hodView = tiferesPolicy.update("critical", netzachIndex * 600);
	}
	assert.equal(hodView.scale, 0.4);
	assert.equal(hodView.minScale, 0.4);
});

test("warning degradation is prompt while visual recovery requires sustained stability", () => {
	const tiferesPolicy = createTiferesOhrfrontScalePolicy();
	assert.equal(tiferesPolicy.update("warning", 0).scale, 1);
	assert.equal(tiferesPolicy.update("warning", 600).scale, 0.9);
	for (let netzachIndex = 1; netzachIndex <= 23; netzachIndex += 1) {
		assert.equal(tiferesPolicy.update("stable", 600 + netzachIndex * 200).scale, 0.9);
	}
	assert.equal(tiferesPolicy.update("stable", 5400).scale, 1);
});
