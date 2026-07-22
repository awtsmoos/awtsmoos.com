// B"H
// Boruch Hashem
// Blessed is He
/** FLIP and vorticity evidence proves rotational curl, confinement, and velocity-delta transfer. */

import assert from "node:assert/strict";
import {
	applyVorticityConfinement3d,
	computeCollocatedGridVorticity3d,
	createWebGpuGridLayout3d,
	transferGridVelocityFlipToParticles3d
} from "../src/core/proceduralObject/webgpu3d/index.js";

function grid(dimensions, velocityAt) {
	const layout = createWebGpuGridLayout3d({
		gridCellCount: dimensions.reduce((product, value) => product * value, 1),
		gridDimensions: dimensions,
		gridCellSize: 1
	});
	const values = new Float32Array(layout.cellCount * 4);
	for (let z = 0; z < dimensions[2]; z += 1) {
		for (let y = 0; y < dimensions[1]; y += 1) {
			for (let x = 0; x < dimensions[0]; x += 1) {
				const index = x + dimensions[0] * (y + dimensions[1] * z);
				const velocity = velocityAt(x, y, z);
				values.set(velocity, index * 4);
				values[index * 4 + 3] = 1;
			}
		}
	}
	return Object.freeze({ layout, values });
}

const uniform = grid([5, 5, 5], () => [2, -1, 0.5]);
const uniformCurl = computeCollocatedGridVorticity3d(uniform);
assert.equal(uniformCurl.maximumMagnitude, 0);
assert.ok([...uniformCurl.values].every(Number.isFinite));

const rotational = grid([5, 5, 5], (x, y) => [-(y - 2), x - 2, 0]);
const curl = computeCollocatedGridVorticity3d(rotational);
const center = 2 + 5 * (2 + 5 * 2);
assert.ok(Math.abs(curl.values[center * 4]) < 1e-7);
assert.ok(Math.abs(curl.values[center * 4 + 1]) < 1e-7);
assert.ok(Math.abs(curl.values[center * 4 + 2] - 2) < 1e-7);
assert.ok(Math.abs(curl.values[center * 4 + 3] - 2) < 1e-7);

const confinementGrid = grid([3, 3, 3], () => [0, 0, 0]);
const vorticityValues = new Float32Array(confinementGrid.values.length);
const confinementCenter = 1 + 3 * (1 + 3 * 1);
vorticityValues.set([0, 0, 2, 2], confinementCenter * 4);
vorticityValues[(2 + 3 * (1 + 3 * 1)) * 4 + 3] = 4;
vorticityValues[(0 + 3 * (1 + 3 * 1)) * 4 + 3] = 0;
const confined = applyVorticityConfinement3d(confinementGrid, {
	layout: confinementGrid.layout,
	values: vorticityValues
}, {
	deltaTime: 0.5,
	vorticityStrength: 1
});
assert.ok(Math.abs(confined.values[confinementCenter * 4]) < 1e-7);
assert.ok(Math.abs(confined.values[confinementCenter * 4 + 1] + 1) < 1e-7);
assert.ok(Math.abs(confined.values[confinementCenter * 4 + 2]) < 1e-7);
const noConfinement = applyVorticityConfinement3d(confinementGrid, {
	layout: confinementGrid.layout,
	values: vorticityValues
}, {
	deltaTime: 1,
	vorticityStrength: 0
});
assert.deepEqual(noConfinement.values, confinementGrid.values);

const current = grid([2, 2, 2], () => [3, 0, 0]);
const previous = grid([2, 2, 2], () => [1, 0, 0]);
const particle = {
	id: "flip",
	position: [0.5, 0.5, 0.5],
	velocity: [10, 0, 0],
	mass: 1,
	size: 0,
	age: 0,
	lifetime: 10
};
const transfer = flipBlend => transferGridVelocityFlipToParticles3d(
	[particle],
	current,
	previous,
	{ deltaTime: 0, damping: 1, flipBlend }
).particles[0].velocity;
assert.deepEqual(transfer(0), [3, 0, 0]);
assert.deepEqual(transfer(1), [12, 0, 0]);
assert.deepEqual(transfer(0.5), [7.5, 0, 0]);
assert.deepEqual(transferGridVelocityFlipToParticles3d(
	[particle], current, null,
	{ deltaTime: 0, damping: 1, flipBlend: 1 }
).particles[0].velocity, [10, 0, 0]);
const empty = Object.freeze({
	layout: current.layout,
	values: new Float32Array(current.values.length)
});
assert.deepEqual(transferGridVelocityFlipToParticles3d(
	[particle], empty, previous,
	{ deltaTime: 0, damping: 1, flipBlend: 1 }
).particles[0].velocity, [10, 0, 0]);
assert.throws(() => applyVorticityConfinement3d(
	confinementGrid,
	{ layout: confinementGrid.layout, values: vorticityValues },
	{ vorticityStrength: -1 }
), /finite and nonnegative/);

console.log('B"H | proceduralObjectWebGpuFlipVorticity3d.test passed');
