// B"H
// Boruch Hashem
// Blessed is He
/** Integrated evidence proves liquid particles cannot remain beneath a signed solid floor. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const floor = api.createSolidCollider3d({
	id: "solid.floor",
	field: {
		kind: "plane",
		parameters: { normal: [0, 1, 0], offset: 0 }
	}
});
const state = api.createParticleGridLiquidState({
	grid: {
		width: 9,
		height: 9,
		depth: 9,
		origin: [-1, -1, -1],
		cellSize: 0.25
	},
	blend: 1,
	particleSystem: {
		id: "liquid.floor",
		particles: [{
			id: "drop",
			position: [0, 0.12, 0],
			velocity: [0, -5, 0],
			size: 0.1,
			mass: 1,
			lifetime: 10,
			attributes: { phase: "water" }
		}]
	}
});
const options = {
	deltaTime: 0.1,
	gravity: [0, 0, 0],
	blend: 1,
	pressureIterationCandidates: [],
	solidBoundaryWidth: 0,
	solidColliders: [floor]
};
const first = api.stepParticleGridLiquid3d(state, options);
const second = api.stepParticleGridLiquid3d(state, options);
assert.deepEqual(first, second);
const particle = first.state.particleSystem.particles[0];
assert.ok(api.sampleSignedDistanceField(floor.field, particle.position) >= particle.size - 1e-6);
assert.ok(first.report.solidContactCount > 0);
assert.ok(first.report.solidProjectedParticleEvents > 0);
assert.ok(first.report.solidConstrainedCellCount > 0);
assert.deepEqual(particle.attributes, { phase: "water" });
assert.equal(particle.id, "drop");

console.log('B"H | proceduralObjectLiquidSolidIntegration3d.test passed');
