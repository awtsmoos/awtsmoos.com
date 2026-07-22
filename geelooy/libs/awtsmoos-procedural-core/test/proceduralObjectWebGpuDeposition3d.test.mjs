// B"H
// Boruch Hashem
// Blessed is He
/** Deposition evidence proves deterministic trilinear fixed-point mass and momentum. */

import assert from "node:assert/strict";
import {
	WEB_GPU_LIQUID_ENTRY_POINTS,
	WEB_GPU_LIQUID_WGSL,
	createWebGpuGridLayout3d,
	depositParticlesToFixedPointGrid3d
} from "../src/core/proceduralObject/webgpu3d/index.js";

const layoutInput = {
	gridCellCount: 8,
	gridDimensions: [2, 2, 2],
	gridOrigin: [0, 0, 0],
	gridCellSize: 1
};
const layout = createWebGpuGridLayout3d(layoutInput);
assert.equal(layout.cellCount, 8);
assert.deepEqual(layout.dimensions, [2, 2, 2]);
assert.throws(() => createWebGpuGridLayout3d({
	gridCellCount: 8,
	gridDimensions: [2, 2, 3]
}), /multiply/);
assert.throws(() => createWebGpuGridLayout3d({
	gridCellCount: 8,
	gridCellSize: 0
}), /positive/);

const centeredParticle = {
	position: [0.5, 0.5, 0.5],
	velocity: [2, -1, 0.5],
	mass: 1
};
const first = depositParticlesToFixedPointGrid3d([centeredParticle], {
	...layoutInput,
	fixedPointScale: 1024
});
const second = depositParticlesToFixedPointGrid3d([centeredParticle], {
	...layoutInput,
	fixedPointScale: 1024
});
assert.deepEqual(first.values, second.values);
for (let cell = 0; cell < 8; cell += 1) {
	assert.deepEqual([...first.values.slice(cell * 4, cell * 4 + 4)], [
		128, 256, -128, 64
	]);
}
const totals = [0, 1, 2, 3].map(channel => {
	let total = 0;
	for (let cell = 0; cell < 8; cell += 1) total += first.values[cell * 4 + channel];
	return total;
});
assert.deepEqual(totals, [1024, 2048, -1024, 512]);

const clipped = depositParticlesToFixedPointGrid3d([{
	...centeredParticle,
	position: [-0.5, 0.5, 0.5]
}], {
	...layoutInput,
	fixedPointScale: 1024
});
let clippedMass = 0;
for (let cell = 0; cell < 8; cell += 1) clippedMass += clipped.values[cell * 4];
assert.equal(clippedMass, 512);
assert.throws(() => depositParticlesToFixedPointGrid3d([{
	position: [0, 0, 0],
	velocity: [0, 0, 0],
	mass: 2147483647
}], {
	...layoutInput,
	fixedPointScale: 2
}), /32-bit range/);
assert.ok(WEB_GPU_LIQUID_WGSL.includes("fn deposit_particles"));
assert.ok(WEB_GPU_LIQUID_ENTRY_POINTS.includes("deposit_particles"));

console.log('B"H | proceduralObjectWebGpuDeposition3d.test passed');
