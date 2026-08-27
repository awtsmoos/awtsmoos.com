// B"H
// Boruch Hashem
// Blessed is He
/** Packing evidence proves stable particles plus aligned pressure, FLIP, and curl uniforms. */

import assert from "node:assert/strict";
import { createParticleSystem } from "../src/core/proceduralObject/particles/createParticleSystem.js";
import {
	packWebGpuLiquidUniforms3d,
	packWebGpuParticles3d,
	WEB_GPU_PARTICLE_STRIDE_BYTES,
	WEB_GPU_UNIFORM_BUFFER_BYTES
} from "../src/core/proceduralObject/webgpu3d/index.js";

const packed = packWebGpuParticles3d(createParticleSystem({
	particles: [{
		id: "packed",
		position: [1, 2, 3],
		velocity: [4, 5, 6],
		size: 0.25,
		mass: 2,
		age: 0.5,
		lifetime: 8
	}]
}));
assert.equal(packed.strideBytes, WEB_GPU_PARTICLE_STRIDE_BYTES);
assert.deepEqual([...packed.values.slice(0, 12)], [
	1, 2, 3, 0.25,
	4, 5, 6, 2,
	0.5, 8, 0, 0
]);
const uniforms = packWebGpuLiquidUniforms3d({
	deltaTime: 1 / 60,
	particleCount: 7,
	gridCellCount: 64,
	gridDimensions: [4, 4, 4],
	gridOrigin: [-1, -2, -3],
	gridCellSize: 0.5,
	frameIndex: 3,
	gravity: [0, -9.81, 1],
	boundsMin: [-2, -3, -4],
	boundsMax: [2, 3, 4],
	damping: 0.98,
	restitution: 0.25,
	fixedPointScale: 2048,
	picBlend: 0.375,
	fluidDensity: 998.2,
	pressureRelaxation: 0.8,
	flipBlend: 0.93,
	vorticityStrength: 2.5
});
assert.equal(uniforms.byteLength, WEB_GPU_UNIFORM_BUFFER_BYTES);
assert.equal(uniforms.flipBlend, 0.93);
assert.equal(uniforms.vorticityStrength, 2.5);
const view = new DataView(uniforms.buffer);
assert.ok(Math.abs(view.getFloat32(116, true) - 998.2) < 0.001);
assert.ok(Math.abs(view.getFloat32(120, true) - 0.8) < 1e-6);
assert.ok(Math.abs(view.getFloat32(124, true) - 0.93) < 1e-6);
assert.equal(view.getFloat32(128, true), 2.5);
assert.equal(packWebGpuLiquidUniforms3d({
	gridCellCount: 1,
	flipBlend: 2
}).flipBlend, 1);
assert.throws(() => packWebGpuLiquidUniforms3d({
	gridCellCount: 1,
	vorticityStrength: -1
}), /finite and nonnegative/);

console.log('B"H | proceduralObjectWebGpuPacking3d.test passed');
