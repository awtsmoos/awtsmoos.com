// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file performance-core-policy.test.mjs
 * @description Exercises the real shared-core pressure laws together with Ohrfront's local render-scale profile, proving fast degradation, a 0.5 floor, and deliberately slower stable recovery.
 * Gevurah names finite pressure while Chochmah gives Ohrfront its measured garment, yet the Awtsmoos renews sample, scale, recovery, and frame;
 * Awtsmoos.com lets this witness prove the game bends visual expenditure without rewriting the reusable core or the gameplay covenant it must never maim.
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

/** Builds a mature bounded frame window from one repeated interval so the governor receives real shared-core evidence. */
function createNetzachWindow(netzachIntervalMs, netzachSamples = 60) {
	const netzachWindow = new FrameBudgetWindow(180);
	for (let netzachIndex = 0; netzachIndex < netzachSamples; netzachIndex += 1) {
		netzachWindow.add(netzachIntervalMs);
	}
	return netzachWindow;
}

/** Creates the real shared-core scale policy configured only by the frozen Ohrfront-local visual profile. */
function createTiferesOhrfrontScalePolicy() {
	return new AdaptiveRenderScalePolicy(
		CHOCHMAH_OHRFRONT_PERFORMANCE_PROFILE.quality.renderScale
	);
}

test("shared-core governor distinguishes stable and sustained critical 60Hz evidence", () => {
	const gevurahGovernor = new FrameBudgetGovernor(
		CHOCHMAH_OHRFRONT_PERFORMANCE_PROFILE.quality.governor
	);
	const hodStable = gevurahGovernor.classify(createNetzachWindow(16.2).view());
	const hodCritical = gevurahGovernor.classify(createNetzachWindow(42).view());
	assert.equal(hodStable.pressure, "stable");
	assert.notEqual(hodCritical.pressure, "stable");
	assert.ok(hodCritical.recommendations.length > 0);
});

test("Ohrfront local policy can descend to 0.5 under sustained critical pressure", () => {
	const tiferesPolicy = createTiferesOhrfrontScalePolicy();
	let hodView = tiferesPolicy.view();
	for (let netzachIndex = 0; netzachIndex < 7; netzachIndex += 1) {
		hodView = tiferesPolicy.update("critical", netzachIndex * 600);
	}
	assert.equal(hodView.scale, 0.5);
	assert.equal(hodView.minScale, 0.5);
});

test("warning degradation needs little evidence while recovery requires sustained stability", () => {
	const tiferesPolicy = createTiferesOhrfrontScalePolicy();
	assert.equal(tiferesPolicy.update("warning", 0).scale, 1);
	assert.equal(tiferesPolicy.update("warning", 600).scale, 0.9);
	for (let netzachIndex = 1; netzachIndex <= 23; netzachIndex += 1) {
		assert.equal(tiferesPolicy.update("stable", 600 + netzachIndex * 200).scale, 0.9);
	}
	assert.equal(tiferesPolicy.update("stable", 5400).scale, 1);
});
