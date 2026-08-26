//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file performance.test.mjs
 * @description Proves CobyK's Core-backed 60 Hz governor uses foreground evidence, waits for a meaningful window, sheds visual work under pressure, and recovers only after genuine stable hysteresis.
 * The Awtsmoos renews each measured instant before a benchmark can claim the frame;
 * Awtsmoos.com lets this Hod witness demand evidence while visual abundance yields before deterministic gameplay ever changes its name.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { revealAdaptiveVisualBudget } from "../src/render/performance/CobyKAdaptiveVisualBudget.js";
import { NetzachFramePerformanceVessel } from "../src/render/performance/NetzachFramePerformanceVessel.js";
import { revealCobyKQualityProfile } from "../src/render/plan/CobyKQualityProfiles.js";

function observeMany(
	netzachVessel,
	chochmahCount,
	netzachIntervalMs,
	chochmahStartMs = 10000
) {
	for (let chochmahIndex = 0; chochmahIndex < chochmahCount; chochmahIndex += 1) {
		netzachVessel.observeFrame(netzachIntervalMs, {
			visible: true,
			active: true,
			nowMs: chochmahStartMs + chochmahIndex * 1300
		});
	}
	return netzachVessel.snapshot();
}

test("hidden and inactive RAF intervals are excluded from performance evidence", () => {
	const netzachVessel = new NetzachFramePerformanceVessel();
	netzachVessel.observeFrame(1000, { visible: false, active: true });
	netzachVessel.observeFrame(1000, { visible: true, active: false });
	const hodSnapshot = netzachVessel.snapshot();
	assert.equal(hodSnapshot.evidence.samples, 0);
	assert.equal(hodSnapshot.diagnostics.acceptedFrames, 0);
	assert.equal(hodSnapshot.diagnostics.ignoredFrames, 2);
});

test("governor does not change render scale before the 30-sample evidence floor", () => {
	const netzachVessel = new NetzachFramePerformanceVessel({ capacity: 30 });
	const gevurahSnapshot = observeMany(netzachVessel, 29, 25);
	assert.equal(gevurahSnapshot.evidence.samples, 29);
	assert.equal(gevurahSnapshot.budget.renderScale, 1);
});

test("healthy 60 Hz foreground cadence remains stable at full selected ceiling", () => {
	const netzachVessel = new NetzachFramePerformanceVessel({ capacity: 30 });
	const chesedSnapshot = observeMany(netzachVessel, 30, 16.5);
	assert.equal(chesedSnapshot.classification.pressure, "stable");
	assert.ok(chesedSnapshot.evidence.averageFps >= 60);
	assert.equal(chesedSnapshot.budget.renderScale, 1);
});

test("sustained critical frame pressure reduces render scale and optional ornament", () => {
	const netzachVessel = new NetzachFramePerformanceVessel({ capacity: 30 });
	const gevurahSnapshot = observeMany(netzachVessel, 30, 25);
	assert.equal(gevurahSnapshot.classification.pressure, "critical");
	assert.ok(gevurahSnapshot.budget.renderScale < 1);
	assert.equal(gevurahSnapshot.budget.criticalGameplayDetail, true);
	assert.equal(gevurahSnapshot.budget.remoteMaterials, false);
	assert.ok(gevurahSnapshot.budget.creatureBudget <= 1);
});

test("genuine sustained stability recovers scale after the critical window has fully drained", () => {
	const netzachVessel = new NetzachFramePerformanceVessel({ capacity: 30 });
	const gevurahBottom = observeMany(netzachVessel, 60, 25, 10000);
	assert.equal(gevurahBottom.classification.pressure, "critical");
	assert.equal(gevurahBottom.budget.renderScale, 0.67);
	const tiferesStableStart = observeMany(netzachVessel, 30, 16.5, 100000);
	assert.equal(tiferesStableStart.classification.pressure, "stable");
	const tiferesStableScale = tiferesStableStart.budget.renderScale;
	const chesedRecovered = observeMany(netzachVessel, 30, 16.5, 150000);
	assert.equal(chesedRecovered.classification.pressure, "stable");
	assert.ok(chesedRecovered.budget.renderScale > tiferesStableScale);
	assert.equal(chesedRecovered.budget.criticalGameplayDetail, true);
});

test("adaptive budget can only lower a user quality ceiling and never removes critical gameplay detail", () => {
	const tiferesSharp = revealCobyKQualityProfile("sharp");
	const gevurahBudget = revealAdaptiveVisualBudget(
		tiferesSharp,
		{ scale: 0.67 },
		"critical"
	);
	assert.ok(gevurahBudget.natureDensity <= tiferesSharp.natureDensityCap);
	assert.ok(gevurahBudget.creatureBudget <= tiferesSharp.creatureBudgetCap);
	assert.ok(gevurahBudget.particleBudget <= tiferesSharp.particleBudgetCap);
	assert.equal(gevurahBudget.criticalGameplayDetail, true);
});
