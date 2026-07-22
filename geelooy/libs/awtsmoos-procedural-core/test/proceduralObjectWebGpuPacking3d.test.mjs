// B"H
// Boruch Hashem
// Blessed is He
/** Packing evidence proves stable particle stride and aligned deterministic uniforms. */

import assert from "node:assert/strict";
import { createParticleSystem } from "../src/core/proceduralObject/particles/createParticleSystem.js";
import {
	packWebGpuLiquidUniforms3d,
	packWebGpuParticles3d,
	WEB_GPU_PARTICLE_STRIDE_BYTES,
	WEB_GPU_UNIFORM_BUFFER_BYTES
} from "../src/core/proceduralObject/webgpu3d/index.js";

const particles = createParticleSystem({
	particles: [{
		id: "packed",
		position: [1, 2, 3],
		velocity: [4, 5, 6],
		size: 0.25,
		mass: 2,
		age: 0.5,
		lifetime: 8
	}]
});
const packed = packWebGpuParticles3d(particles);
assert.equal(packed.strideBytes, WEB_GPU_PARTICLE_STRIDE_BYTES);
assert.equal(packed.byteLength, WEB_GPU_PARTICLE_STRIDE_BYTES);
assert.deepEqual([...packed.values.slice(0, 12)], [
	1, 2, 3, 0.25,
	4, 5, 6, 2,
	0.5, 8, 0, 0
]);

const input = {
	deltaTime: 1 / 60,
	particleCount: 7,
	gridCellCount: 64,
	frameIndex: 3,
	gravity: [0, -9.81, 1],
	boundsMin: [-2, -3, -4],
	boundsMax: [2, 3, 4],
	damping: 0.98,
	restitution: 0.25,
	fixedPointScale: 2048
};
const first = packWebGpuLiquidUniforms3d(input);
const second = packWebGpuLiquidUniforms3d(input);
assert.equal(first.byteLength, WEB_GPU_UNIFORM_BUFFER_BYTES);
assert.deepEqual(first.bytes, second.bytes);
const view = new DataView(first.buffer);
assert.ok(Math.abs(view.getFloat32(0, true) - 1 / 60) < 1e-7);
assert.equal(view.getUint32(4, true), 7);
assert.equal(view.getUint32(8, true), 64);
assert.equal(view.getUint32(12, true), 3);
assert.ok(Math.abs(view.getFloat32(20, true) + 9.81) < 1e-5);
assert.equal(view.getFloat32(32, true), -2);
assert.equal(view.getFloat32(56, true), 4);
assert.equal(view.getFloat32(72, true), 2048);

console.log('B"H | proceduralObjectWebGpuPacking3d.test passed');
