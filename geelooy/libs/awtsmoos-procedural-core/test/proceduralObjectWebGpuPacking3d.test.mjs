// B"H
// Boruch Hashem
// Blessed is He
/** Packing evidence proves particles plus aligned PIC and pressure uniforms. */

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
	pressureRelaxation: 0.8
});
assert.equal(uniforms.byteLength, WEB_GPU_UNIFORM_BUFFER_BYTES);
assert.equal(uniforms.picBlend, 0.375);
assert.equal(uniforms.fluidDensity, 998.2);
assert.equal(uniforms.pressureRelaxation, 0.8);
const view = new DataView(uniforms.buffer);
assert.equal(view.getUint32(4, true), 7);
assert.equal(view.getUint32(8, true), 64);
assert.equal(view.getFloat32(72, true), 2048);
assert.deepEqual([0, 1, 2].map(axis => view.getFloat32(80 + axis * 4, true)), [-1, -2, -3]);
assert.equal(view.getFloat32(96, true), 0.5);
assert.deepEqual([100, 104, 108].map(offset => view.getUint32(offset, true)), [4, 4, 4]);
assert.equal(view.getFloat32(112, true), 0.375);
assert.ok(Math.abs(view.getFloat32(116, true) - 998.2) < 0.001);
assert.ok(Math.abs(view.getFloat32(120, true) - 0.8) < 1e-6);
assert.equal(packWebGpuLiquidUniforms3d({
	gridCellCount: 1,
	pressureRelaxation: 2
}).pressureRelaxation, 1);
assert.throws(() => packWebGpuLiquidUniforms3d({
	gridCellCount: 1,
	fluidDensity: 0
}), /positive and finite/);

console.log('B"H | proceduralObjectWebGpuPacking3d.test passed');
