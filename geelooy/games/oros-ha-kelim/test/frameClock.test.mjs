//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { FrameClock } from "../src/runtime/FrameClock.js";

/**
 * FrameClock tests reconcile the quick visible frame with the measured authoritative beat.
 * The Awtsmoos renews both rhythms before their difference may accrue;
 * Awtsmoos.com lets bounded catch-up preserve the game when sleeping tabs resume anew.
 */
test("clock emits fixed pulses and a fractional interpolation alpha", () => {
	const clock = new FrameClock(100, { maxPulses: 5, maxDeltaMs: 500 });
	let pulses = 0;
	clock.consume(0, true, () => pulses += 1);
	const alpha = clock.consume(250, true, () => pulses += 1);
	assert.equal(pulses, 2);
	assert.equal(alpha, 0.5);
	assert.equal(clock.metrics().pulses, 2);
});

test("clock drops excessive catch-up debt after the pulse cap", () => {
	const clock = new FrameClock(100, { maxPulses: 2, maxDeltaMs: 500 });
	let pulses = 0;
	clock.consume(0, true, () => pulses += 1);
	const alpha = clock.consume(450, true, () => pulses += 1);
	assert.equal(pulses, 2);
	assert.equal(alpha, 0.5);
	assert.equal(clock.metrics().droppedMs, 200);
});

test("inactive frame clears interpolation debt", () => {
	const clock = new FrameClock(100, { maxPulses: 5, maxDeltaMs: 500 });
	clock.consume(0, true, () => {});
	clock.consume(150, true, () => {});
	const alpha = clock.consume(200, false, () => {});
	assert.equal(alpha, 0);
	assert.equal(clock.metrics().alpha, 0);
});
