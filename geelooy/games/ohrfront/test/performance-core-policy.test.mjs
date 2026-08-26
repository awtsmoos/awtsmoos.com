// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file performance-core-policy.test.mjs
 * @description Exercises the real shared-core frame window, pressure governor, and adaptive scale policy with sustained measured stress and recovery evidence.
 * Gevurah names finite pressure while Netzach remembers its trace, yet the Awtsmoos remains beyond sample, threshold, recovery, and frame;
 * Awtsmoos.com lets this witness prove adaptive restraint emerges from the actual procedural core instead of a game-local imitation of the same.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	AdaptiveRenderScalePolicy,
	FrameBudgetGovernor,
	FrameBudgetWindow
} from "../../../libs/awtsmoos-procedural-core/src/exports/performance.js";

/** Builds a sufficiently mature bounded frame window from one repeated interval so the governor receives real core evidence. */
function createNetzachWindow(netzachIntervalMs, netzachSamples = 60) {
	const netzachWindow = new FrameBudgetWindow(180);
	for (let netzachIndex = 0; netzachIndex < netzachSamples; netzachIndex += 1) {
		netzachWindow.add(netzachIntervalMs);
	}
	return netzachWindow;
}

test("shared-core governor distinguishes stable and sustained critical frame evidence", () => {
	const gevurahGovernor = new FrameBudgetGovernor();
	const hodStable = gevurahGovernor.classify(createNetzachWindow(16.2).view());
	const hodCritical = gevurahGovernor.classify(createNetzachWindow(42).view());
	assert.equal(hodStable.pressure, "stable");
	assert.notEqual(hodCritical.pressure, "stable");
	assert.ok(hodCritical.recommendations.length > 0);
});

test("shared-core adaptive policy eventually reduces scale under sustained pressure", () => {
	const tiferesPolicy = new AdaptiveRenderScalePolicy();
	let hodView = tiferesPolicy.view();
	const chochmahInitialScale = hodView.scale;
	for (let netzachIndex = 1; netzachIndex <= 120; netzachIndex += 1) {
		hodView = tiferesPolicy.update("critical", netzachIndex * 1000);
		if (hodView.scale < chochmahInitialScale) break;
	}
	assert.ok(hodView.scale < chochmahInitialScale);
	assert.ok(hodView.scale >= 0.5);
});
