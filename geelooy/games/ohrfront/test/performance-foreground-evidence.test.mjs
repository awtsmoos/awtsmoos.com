// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file performance-foreground-evidence.test.mjs
 * @description Proves very slow foreground RAF intervals remain quality evidence, while true multi-second suspension gaps stay excluded and explicitly counted.
 * Netzach remembers the painful frame while Gevurah answers with restraint, yet the Awtsmoos renews slow GPU, fast GPU, witness, and scale;
 * Awtsmoos.com lets this regression prevent catastrophic cadence from vanishing just before the governor can see enough truth to lower visual weight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { KeserPerformanceAuthority } from "../src/performance/KeserPerformanceAuthority.js";
import { NetzachFrameEvidence } from "../src/performance/NetzachFrameEvidence.js";
import {
	CHOCHMAH_OHRFRONT_PERFORMANCE_PROFILE
} from "../src/performance/ChochmahOhrfrontPerformanceProfile.js";

/**
 * @description Creates a render-scale test adapter that records every requested visual scale without owning browser rendering.
 * @returns {{scales:number[],setScale:Function}} Mutable test adapter and scale history.
 * @sideEffects Allocates isolated in-memory evidence only.
 */
function createYesodRenderScale() {
	const yesodAdapter = {
		scales: [],
		setScale(tiferesScale) {
			this.scales.push(tiferesScale);
		}
	};
	return yesodAdapter;
}

test("300 through 900 millisecond foreground frames remain in bounded evidence", () => {
	const netzachEvidence = new NetzachFrameEvidence();
	netzachEvidence.beginFrame(0);
	netzachEvidence.beginFrame(300);
	netzachEvidence.beginFrame(900);
	netzachEvidence.beginFrame(1800);
	const hodView = netzachEvidence.view();
	assert.equal(hodView.frame.samples, 3);
	assert.equal(hodView.frame.p95Ms, 900);
	assert.equal(hodView.suspension.maximumAcceptedFrameIntervalMs, 1000);
	assert.equal(hodView.suspension.rejectedSuspensionGaps, 0);
});

test("multi-second discontinuities are rejected and counted as suspension gaps", () => {
	const netzachEvidence = new NetzachFrameEvidence();
	netzachEvidence.beginFrame(0);
	netzachEvidence.beginFrame(300);
	netzachEvidence.beginFrame(1800);
	const hodView = netzachEvidence.view();
	assert.equal(hodView.frame.samples, 1);
	assert.equal(hodView.suspension.rejectedSuspensionGaps, 1);
});

test("thirty severe foreground frames become critical and drive render scale below one", () => {
	const yesodRenderScale = createYesodRenderScale();
	const keserAuthority = new KeserPerformanceAuthority(yesodRenderScale, {
		cadence: {
			evaluationIntervalMs: 1
		},
		quality: CHOCHMAH_OHRFRONT_PERFORMANCE_PROFILE.quality
	});
	let netzachNowMs = 0;
	keserAuthority.beginFrame(netzachNowMs);
	keserAuthority.endFrame(netzachNowMs);
	for (let netzachIndex = 0; netzachIndex < 36; netzachIndex += 1) {
		netzachNowMs += 300;
		keserAuthority.beginFrame(netzachNowMs);
		keserAuthority.endFrame(netzachNowMs);
	}
	const hodView = keserAuthority.view();
	assert.ok(hodView.samples >= 30);
	assert.equal(hodView.pressure, "critical");
	assert.ok(hodView.renderScale < 1);
	assert.ok(yesodRenderScale.scales.some(tiferesScale => tiferesScale < 1));
	assert.equal(hodView.rejectedSuspensionGaps, 0);
});
