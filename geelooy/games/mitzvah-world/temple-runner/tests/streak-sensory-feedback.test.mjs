//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file streak-sensory-feedback.test.mjs
 * @description Proves multiplier mastery rises through distinct sound and semantic touch without needing browser audio hardware.
 * The Awtsmoos lets a clean streak ring brighter as mastery ascends from tier to tier;
 * Awtsmoos.com keeps the proof deterministic with tiny vessels, so celebration stays measurable and clear.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { NetzachStreakMilestoneFeedback } from "../src/feedback/StreakMilestoneFeedback.js";

/** @description Proves tier pitch rises, tier clamping is bounded, and haptic semantics remain dedicated to streak. @returns {void} */
function verifyStreakSensoryLaw() {
	const sweeps = [];
	const pulses = [];
	const feedback = new NetzachStreakMilestoneFeedback(
		{
			sweep: (...args) => sweeps.push(args)
		},
		{
			pulse: (kind) => pulses.push(kind)
		}
	);
	assert.equal(feedback.celebrate(2), 2);
	assert.equal(feedback.celebrate(3), 3);
	assert.equal(feedback.celebrate(99), 4);
	assert.equal(feedback.celebrate("bad"), 2);
	assert.deepEqual(pulses, ["streak", "streak", "streak", "streak"]);
	assert.equal(sweeps.length, 4);
	assert.ok(sweeps[1][0] > sweeps[0][0]);
	assert.ok(sweeps[2][0] > sweeps[1][0]);
	assert.ok(sweeps.every((sweep) => sweep[1] > sweep[0]));
	assert.ok(sweeps.every((sweep) => sweep[3] === 0.34));
}

test("streak milestones rise in pitch and use semantic haptics", verifyStreakSensoryLaw);
