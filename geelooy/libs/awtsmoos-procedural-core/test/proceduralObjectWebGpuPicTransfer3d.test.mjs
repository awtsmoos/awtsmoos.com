// B"H
// Boruch Hashem
// Blessed is He
/** PIC evidence proves normalization, occupied sampling, blending, integration, and fallback. */

import assert from "node:assert/strict";
import {
	WEB_GPU_LIQUID_ENTRY_POINTS,
	WEB_GPU_LIQUID_WGSL,
	depositParticlesToFixedPointGrid3d,
	normalizeFixedPointGrid3d,
	sampleGridVelocity3d,
	transferGridVelocityToParticles3d
} from "../src/core/proceduralObject/webgpu3d/index.js";

const layout = {
	gridCellCount: 8,
	gridDimensions: [2, 2, 2],
	gridOrigin: [0, 0, 0],
	gridCellSize: 1
};
const particle = {
	id: "pic",
	position: [0.5, 0.5, 0.5],
	velocity: [2, -1, 0.5],
	mass: 1,
	size: 0,
	age: 0,
	lifetime: 10
};
const deposited = depositParticlesToFixedPointGrid3d([particle], {
	...layout,
	fixedPointScale: 1024
});
const normalized = normalizeFixedPointGrid3d(deposited);
for (let cell = 0; cell < 8; cell += 1) {
	assert.deepEqual([...normalized.values.slice(cell * 4, cell * 4 + 4)], [
		2, -1, 0.5, 0.125
	]);
}
const sampled = sampleGridVelocity3d(normalized, particle.position);
assert.deepEqual(sampled.velocity, [2, -1, 0.5]);
assert.equal(sampled.occupiedWeight, 1);

const oldParticle = {
	...particle,
	velocity: [0, 0, 0]
};
const full = transferGridVelocityToParticles3d([oldParticle], normalized, {
	deltaTime: 0.5,
	picBlend: 1,
	damping: 1
});
assert.deepEqual(full.particles[0].velocity, [2, -1, 0.5]);
assert.deepEqual(full.particles[0].position, [1.5, 0, 0.75]);
const half = transferGridVelocityToParticles3d([oldParticle], normalized, {
	deltaTime: 0,
	picBlend: 0.5,
	damping: 1
});
assert.deepEqual(half.particles[0].velocity, [1, -0.5, 0.25]);
const zero = transferGridVelocityToParticles3d([particle], normalized, {
	deltaTime: 0,
	picBlend: 0,
	damping: 1
});
assert.deepEqual(zero.particles[0].velocity, particle.velocity);

const clipped = depositParticlesToFixedPointGrid3d([{
	...particle,
	position: [-0.5, 0.5, 0.5]
}], {
	...layout,
	fixedPointScale: 1024
});
const boundarySample = sampleGridVelocity3d(
	normalizeFixedPointGrid3d(clipped),
	[-0.5, 0.5, 0.5]
);
assert.deepEqual(boundarySample.velocity, [2, -1, 0.5]);
assert.equal(boundarySample.occupiedWeight, 0.5);

const emptyGrid = normalizeFixedPointGrid3d({
	...deposited,
	values: new Int32Array(32)
});
const fallback = transferGridVelocityToParticles3d([particle], emptyGrid, {
	deltaTime: 0,
	picBlend: 1,
	damping: 1
});
assert.deepEqual(fallback.particles[0].velocity, particle.velocity);
assert.ok(WEB_GPU_LIQUID_WGSL.includes("fn normalize_grid"));
assert.ok(WEB_GPU_LIQUID_WGSL.includes("fn transfer_grid_to_particles"));
assert.ok(WEB_GPU_LIQUID_ENTRY_POINTS.includes("normalize_grid"));
assert.ok(WEB_GPU_LIQUID_ENTRY_POINTS.includes("transfer_grid_to_particles"));

console.log('B"H | proceduralObjectWebGpuPicTransfer3d.test passed');
