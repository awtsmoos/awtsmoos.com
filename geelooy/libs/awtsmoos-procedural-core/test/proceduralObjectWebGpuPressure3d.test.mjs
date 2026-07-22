// B"H
// Boruch Hashem
// Blessed is He
/** Pressure evidence proves deterministic Jacobi projection reduces manufactured divergence. */

import assert from "node:assert/strict";
import { createWebGpuGridLayout3d } from "../src/core/proceduralObject/webgpu3d/createWebGpuGridLayout3d.js";
import { computeCollocatedGridDivergence3d } from "../src/core/proceduralObject/webgpu3d/computeCollocatedGridDivergence3d.js";
import { solveCollocatedGridPressure3d } from "../src/core/proceduralObject/webgpu3d/solveCollocatedGridPressure3d.js";
import { projectCollocatedGridVelocity3d } from "../src/core/proceduralObject/webgpu3d/projectCollocatedGridVelocity3d.js";

const dimensions = [7, 7, 7];
const layout = createWebGpuGridLayout3d({
	gridCellCount: dimensions.reduce((product, value) => product * value, 1),
	gridDimensions: dimensions,
	gridCellSize: 1
});
const scalar = (x, y, z) => {
	if (x <= 0 || y <= 0 || z <= 0 || x >= 6 || y >= 6 || z >= 6) return 0;
	return Math.sin(Math.PI * x / 6)
		* Math.sin(Math.PI * y / 6)
		* Math.sin(Math.PI * z / 6);
};
const index = (x, y, z) => x + 7 * (y + 7 * z);
const values = new Float32Array(layout.cellCount * 4);
for (let z = 1; z < 6; z += 1) {
	for (let y = 1; y < 6; y += 1) {
		for (let x = 1; x < 6; x += 1) {
			const offset = index(x, y, z) * 4;
			values[offset] = (scalar(x + 1, y, z) - scalar(x - 1, y, z)) / 2;
			values[offset + 1] = (scalar(x, y + 1, z) - scalar(x, y - 1, z)) / 2;
			values[offset + 2] = (scalar(x, y, z + 1) - scalar(x, y, z - 1)) / 2;
			values[offset + 3] = 1;
		}
	}
}
const grid = Object.freeze({ layout, values });
const divergence = computeCollocatedGridDivergence3d(grid);
assert.equal(divergence.occupiedCount, 125);
assert.ok(divergence.l2Norm > 0.1);
for (let z = 0; z < 7; z += 1) {
	assert.equal(divergence.values[index(0, 0, z)], 0);
}
const pressure = solveCollocatedGridPressure3d(grid, {
	divergence,
	deltaTime: 1,
	fluidDensity: 1,
	pressureIterations: 100,
	pressureRelaxation: 1
});
const pressureAgain = solveCollocatedGridPressure3d(grid, {
	divergence,
	deltaTime: 1,
	fluidDensity: 1,
	pressureIterations: 100,
	pressureRelaxation: 1
});
assert.deepEqual(pressure.values, pressureAgain.values);
assert.ok(Number.isFinite(pressure.residual));
assert.ok([...pressure.values].every(Number.isFinite));
const projected = projectCollocatedGridVelocity3d(grid, pressure);
assert.ok(projected.divergenceAfter.l2Norm < divergence.l2Norm * 0.35, JSON.stringify({
	before: divergence.l2Norm,
	after: projected.divergenceAfter.l2Norm
}));
assert.ok([...projected.values].every(Number.isFinite));
assert.throws(() => solveCollocatedGridPressure3d(grid, {
	pressureIterations: 3
}), /positive even integer/);
assert.throws(() => solveCollocatedGridPressure3d(grid, {
	fluidDensity: 0
}), /positive and finite/);
assert.throws(() => projectCollocatedGridVelocity3d(grid, pressure, {
	deltaTime: 0
}), /positive and finite/);

console.log('B"H | proceduralObjectWebGpuPressure3d.test passed');
