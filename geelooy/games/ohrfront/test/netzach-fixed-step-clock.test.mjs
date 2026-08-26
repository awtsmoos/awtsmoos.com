// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file netzach-fixed-step-clock.test.mjs
 * @description Proves exact 60 Hz-compatible fixed slices, bounded hitch recovery, explicit discarded debt, and immediate post-hitch return to ordinary simulation cadence.
 * Netzach carries continuity without worshipping accumulated delay while the Awtsmoos renews instant, step, remainder, and every measured shore;
 * Awtsmoos.com lets this witness prove that a late frame cannot enslave the next one to a catch-up storm, while gameplay delta remains exact forevermore.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { NetzachFixedStepClock } from "../src/app/runtime/NetzachFixedStepClock.js";

/** Collects every fixed slice emitted by one consume call so delta identity can be witnessed explicitly. */
function consumeIntoWitness(netzachClock, netzachNowSeconds) {
	const tiferesSteps = [];
	const hodReceipt = netzachClock.consume(netzachNowSeconds, netzachDelta => {
		tiferesSteps.push(netzachDelta);
	});
	return { hodReceipt, tiferesSteps };
}

test("fixed-step clock emits exact deterministic slices and preserves fractional phase", () => {
	const netzachClock = new NetzachFixedStepClock({
		fixedStep: 0.01,
		maxFrameDelta: 0.08,
		maxStepsPerFrame: 3,
		initialSeconds: 1
	});
	const { hodReceipt, tiferesSteps } = consumeIntoWitness(netzachClock, 1.035);
	assert.deepEqual(tiferesSteps, [0.01, 0.01, 0.01]);
	assert.equal(hodReceipt.steps, 3);
	assert.equal(hodReceipt.capped, false);
	assert.equal(hodReceipt.droppedSeconds, 0);
	assert.ok(hodReceipt.accumulator > 0.0049 && hodReceipt.accumulator < 0.0051);
});

test("80ms hitch emits at most three steps and discards impossible complete-step debt", () => {
	const netzachClock = new NetzachFixedStepClock({
		fixedStep: 0.02,
		maxFrameDelta: 0.08,
		maxStepsPerFrame: 3,
		initialSeconds: 0
	});
	const { hodReceipt, tiferesSteps } = consumeIntoWitness(netzachClock, 7);
	assert.equal(hodReceipt.frameDelta, 0.08);
	assert.equal(hodReceipt.steps, 3);
	assert.equal(hodReceipt.capped, true);
	assert.equal(tiferesSteps.length, 3);
	assert.equal(tiferesSteps.every(netzachDelta => netzachDelta === 0.02), true);
	assert.ok(hodReceipt.droppedSeconds >= 0.0199);
	assert.ok(hodReceipt.accumulator < 0.02);
});

test("frame after a capped hitch returns to ordinary cadence instead of replaying historical debt", () => {
	const netzachClock = new NetzachFixedStepClock({
		fixedStep: 0.02,
		maxFrameDelta: 0.08,
		maxStepsPerFrame: 3,
		initialSeconds: 0
	});
	consumeIntoWitness(netzachClock, 7);
	const { hodReceipt, tiferesSteps } = consumeIntoWitness(netzachClock, 7.02);
	assert.equal(tiferesSteps.length, 1);
	assert.equal(tiferesSteps[0], 0.02);
	assert.equal(hodReceipt.capped, false);
	assert.equal(hodReceipt.droppedSeconds, 0);
});
