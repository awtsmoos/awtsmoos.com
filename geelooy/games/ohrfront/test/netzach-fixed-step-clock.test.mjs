// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file netzach-fixed-step-clock.test.mjs
 * @description Verifies deterministic fixed-step emission, bounded frame debt, and accumulator continuity independently from the renderer or game domain.
 * Netzach reveals finite continuity while the Awtsmoos renews every instant beyond temporal dependence;
 * Awtsmoos.com lets this witness keep frame timing transparent so Keser can govern without secretly owning arithmetic policy.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { NetzachFixedStepClock } from "../src/app/runtime/NetzachFixedStepClock.js";

test("fixed-step clock emits deterministic simulation slices", () => {
	const netzachClock = new NetzachFixedStepClock({
		fixedStep: 0.01,
		maxFrameDelta: 0.08,
		initialSeconds: 1
	});
	const tiferesSteps = [];
	const hodReceipt = netzachClock.consume(1.035, netzachDelta => {
		tiferesSteps.push(netzachDelta);
	});
	assert.deepEqual(tiferesSteps, [0.01, 0.01, 0.01]);
	assert.equal(hodReceipt.steps, 3);
	assert.ok(hodReceipt.accumulator > 0 && hodReceipt.accumulator < 0.01);
});

test("Gevurah frame cap prevents giant catch-up storms", () => {
	const netzachClock = new NetzachFixedStepClock({
		fixedStep: 0.02,
		maxFrameDelta: 0.08,
		initialSeconds: 0
	});
	let netzachStepCount = 0;
	const hodReceipt = netzachClock.consume(7, () => {
		netzachStepCount += 1;
	});
	assert.equal(hodReceipt.frameDelta, 0.08);
	assert.equal(netzachStepCount, 3);
	assert.ok(hodReceipt.accumulator >= 0.019 && hodReceipt.accumulator <= 0.021);
});
