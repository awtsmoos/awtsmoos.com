// B"H
// Boruch Hashem
// Blessed is He
/** Realtime quality evidence proves bounded adaptive fluid stability. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const profile = api.createRealtimeQualityProfile("high");
assert.equal(profile.name, "high");
assert.equal(profile.maximumSubsteps, 10);

const clamped = api.planAdaptiveSubsteps({
	profile: "high",
	deltaTime: 0.1,
	maximumSpeed: 10,
	characteristicLength: 0.1
});
assert.equal(clamped.substeps, 10);
assert.equal(clamped.clamped, true);
assert.equal(clamped.stableWithinTarget, false);

const state = api.createParticleGridLiquidState({
	grid: {
		width: 9, height: 9, depth: 9,
		origin: [-1, -1, -1],
		cellSize: 0.25
	},
	particleSystem: {
		id: "liquid.adaptive",
		capacity: 2,
		particles: [
			{
				id: "fast-water",
				position: [0, 0.3, 0],
				velocity: [8, 0, 0],
				mass: 1,
				size: 0.2,
				lifetime: 10
			}
		]
	}
});
const options = {
	deltaTime: 0.08,
	quality: "high",
	pressureIterations: 24
};
const first = api.stepParticleGridLiquid3d(state, options);
const second = api.stepParticleGridLiquid3d(state, options);
assert.deepEqual(first, second);
assert.ok(first.report.substeps > 1);
assert.equal(first.report.substepPlan.source, "adaptive");
assert.equal(first.report.qualityProfile, "high");
assert.ok(Number.isFinite(first.report.cfl));

console.log('B"H | proceduralObjectRealtimeQuality.test passed');
