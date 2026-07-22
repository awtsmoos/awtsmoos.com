// B"H
// Boruch Hashem
// Blessed is He
/** Liquid-secondary evidence proves bounded spray, foam, and bubble event derivation. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const state = api.createParticleGridLiquidState({
	id: "liquid-secondary-test",
	tick: 4,
	grid: {
		width: 8,
		height: 8,
		depth: 8,
		origin: [-1, -1, -1],
		cellSize: 0.25
	},
	particleSystem: {
		id: "liquid-secondary-particles",
		capacity: 4,
		particles: [
			{
				id: "spray-source",
				position: [0, 0.4, 0],
				velocity: [2, 5, 0],
				mass: 1,
				size: 0.12,
				age: 0,
				lifetime: 5,
				attributes: {}
			},
			{
				id: "bubble-source",
				position: [0.1, 0.2, 0],
				velocity: [0, 0.7, 0],
				mass: 1,
				size: 0.1,
				age: 0,
				lifetime: 5,
				attributes: {}
			}
		]
	}
});
const report = {
	solidContactCount: 1,
	substepPlan: {
		profile: api.createRealtimeQualityProfile("high")
	}
};
const first = api.createLiquidSecondaryParticleEvents3d(state, report, {
	maximumEvents: 8
});
const second = api.createLiquidSecondaryParticleEvents3d(state, report, {
	maximumEvents: 8
});
assert.deepEqual(first, second);
assert.deepEqual(first.map(event => event.type), ["spray", "bubble"]);
assert.ok(first.every(event => event.id.includes(state.id)));
assert.ok(first.every(event => event.count >= 1 && event.lifetime > 0));
assert.equal(api.createLiquidSecondaryParticleEvents3d(
	state,
	{
		...report,
		substepPlan: {
			profile: api.createRealtimeQualityProfile("preview")
		}
	},
	{ maximumEvents: 1 }
).length, 1);

const stepped = api.stepParticleGridLiquid3d(state, {
	deltaTime: 0.02,
	quality: "high",
	secondaryParticles: {
		spraySpeed: 0.2,
		bubbleRiseSpeed: 0.01,
		maximumEvents: 4
	}
});
assert.ok(Array.isArray(stepped.secondaryParticleEvents));
assert.ok(stepped.secondaryParticleEvents.length <= 4);
assert.equal(
	api.stepParticleGridLiquid3d(state, {
		deltaTime: 0.02,
		secondaryParticles: false
	}).secondaryParticleEvents.length,
	0
);

console.log('B"H | proceduralObjectLiquidSecondaryParticles3d.test passed');
