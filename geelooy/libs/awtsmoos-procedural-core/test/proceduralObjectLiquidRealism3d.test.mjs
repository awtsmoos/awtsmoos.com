// B"H
// Boruch Hashem
// Blessed is He
/** Liquid realism evidence proves neighbor damping, adaptive flow, and secondary typed artifacts. */
import assert from "node:assert/strict";
import { createParticleGridLiquidState } from "../src/core/proceduralObject/liquid3d/createParticleGridLiquidState.js";
import { applyLiquidRealism3d } from "../src/core/proceduralObject/liquid3d/applyLiquidRealism3d.js";
import { createLiquidSecondaryArtifact3d } from "../src/core/proceduralObject/liquid3d/createLiquidSecondaryArtifact3d.js";
import { stepRealisticParticleGridLiquid3d } from "../src/core/proceduralObject/liquid3d/stepRealisticParticleGridLiquid3d.js";

const state = createParticleGridLiquidState({
	grid: { width: 9, height: 9, depth: 9, origin: [-1, -1, -1], cellSize: 0.25 },
	blend: 0.9,
	particleSystem: {
		id: "liquid.realism",
		capacity: 8,
		particles: [
			{ id: "a", position: [-0.18, 0.4, 0], velocity: [0.8, 0, 0], mass: 1, size: 0.3, lifetime: 10, attributes: {} },
			{ id: "b", position: [0.18, 0.4, 0], velocity: [-0.8, 0, 0], mass: 1, size: 0.3, lifetime: 10, attributes: {} }
		]
	}
});
const realism = applyLiquidRealism3d(state, {
	deltaTime: 0.04,
	realism: { profile: "balanced", viscosity: 0.8, cohesion: 0, vorticity: 0 }
});
const relativeBefore = Math.abs(state.particleSystem.particles[0].velocity[0] - state.particleSystem.particles[1].velocity[0]);
const relativeAfter = Math.abs(realism.state.particleSystem.particles[0].velocity[0] - realism.state.particleSystem.particles[1].velocity[0]);
assert.ok(relativeAfter < relativeBefore);
assert.ok(realism.report.averageNeighbors > 0);
assert.ok(realism.state.particleSystem.particles.every(particle => Number.isFinite(particle.attributes.liquidDensity)));
const stepped = stepRealisticParticleGridLiquid3d(state, {
	deltaTime: 0.02,
	substeps: 1,
	pressureIterations: 16,
	realism: "realtime"
});
assert.equal(stepped.state.particleSystem.particles.length, 2);
assert.ok(stepped.report.substepPlan.substeps >= 1);
const secondary = createLiquidSecondaryArtifact3d({
	particleSystem: {
		id: "secondary.test",
		particles: [
			{ id: "spray", position: [0, 0, 0], velocity: [4, 0, 0], attributes: { liquidNeighbors: 0, liquidDensity: 1, liquidVorticity: 0 } },
			{ id: "foam", position: [0, 0, 0], velocity: [0.2, 0, 0], attributes: { liquidNeighbors: 4, liquidDensity: 1, liquidVorticity: 2 } },
			{ id: "bubble", position: [0, 0, 0], velocity: [0, -0.1, 0], attributes: { liquidNeighbors: 30, liquidDensity: 3, liquidVorticity: 0 } }
		]
	}
}, { profile: "balanced" });
assert.deepEqual(secondary.counts, { foam: 1, spray: 1, bubble: 1 });
assert.equal(secondary.positions.length, 9);
console.log('B"H | proceduralObjectLiquidRealism3d.test passed');
