// B"H
// Boruch Hashem
// Blessed is He
/** Liquid stepping evidence proves deterministic gravity, pressure, bounds, and identity. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const state = api.createParticleGridLiquidState({
	grid: {
		width: 9, height: 9, depth: 9,
		origin: [-1, -1, -1],
		cellSize: 0.25
	},
	blend: 0.9,
	particleSystem: {
		id: "liquid.step", capacity: 4,
		particles: [
			{ id: "a", position: [-0.2, 0.4, 0], velocity: [0.4, 0, 0], mass: 1, size: 0.35, lifetime: 10, attributes: { phase: "water" } },
			{ id: "b", position: [0.2, 0.4, 0], velocity: [-0.4, 0, 0], mass: 1, size: 0.35, lifetime: 10, attributes: { phase: "water" } }
		]
	}
});
const options = {
	deltaTime: 0.04,
	substeps: 2,
	pressureIterations: 32,
	restitution: 0,
	blend: 0.9
};
const first = api.stepParticleGridLiquid3d(state, options);
const second = api.stepParticleGridLiquid3d(state, options);
assert.deepEqual(first.state, second.state);
assert.deepEqual(first.report, second.report);
assert.ok(first.state.particleSystem.particles.every(particle => particle.velocity[1] < 0));
assert.ok(first.report.divergenceAfter <= first.report.divergenceBefore + 1e-9);
assert.ok(Math.abs(first.report.gridMassError) < 1e-9);
assert.ok(Number.isFinite(first.report.kineticEnergy));
assert.ok(Number.isFinite(first.report.cfl));
assert.deepEqual(first.state.particleSystem.particles.map(particle => particle.id), ["a", "b"]);
assert.deepEqual(first.state.particleSystem.particles[0].attributes, { phase: "water" });
for (const particle of first.state.particleSystem.particles) {
	for (let axis = 0; axis < 3; axis += 1) {
		const dimension = [state.grid.width, state.grid.height, state.grid.depth][axis];
		const minimum = state.grid.origin[axis];
		const maximum = state.grid.origin[axis] + (dimension - 1) * state.grid.cellSize;
		assert.ok(particle.position[axis] >= minimum);
		assert.ok(particle.position[axis] <= maximum);
	}
}

console.log('B"H | proceduralObjectLiquidStep3d.test passed');
