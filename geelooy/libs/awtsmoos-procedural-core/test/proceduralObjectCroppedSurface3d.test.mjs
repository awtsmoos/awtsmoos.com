// B"H
// Boruch Hashem
// Blessed is He
/** Cropped surface evidence proves bounded cells without losing world-space liquid. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const state = api.createParticleGridLiquidState({
	grid: {
		width: 21,
		height: 21,
		depth: 21,
		origin: [-2, -2, -2],
		cellSize: 0.2
	},
	particleSystem: {
		id: "realtime.crop",
		particles: [
			{ id: "left", position: [-0.25, 0, 0], velocity: [0, 0, 0], size: 0.4, lifetime: 10 },
			{ id: "right", position: [0.25, 0, 0], velocity: [0, 0, 0], size: 0.4, lifetime: 10 }
		]
	}
});
const bounds = api.measureParticleBounds3d(state.particleSystem);
assert.ok(bounds.min[0] <= -0.65);
assert.ok(bounds.max[0] >= 0.65);
assert.ok(bounds.min[1] <= -0.4);
assert.ok(bounds.max[1] >= 0.4);

const crop = api.planCroppedLiquidSurfaceGrid3d(state, {
	cellSize: 0.05,
	maxCells: 1000,
	padding: 0.1
});
assert.ok(crop.estimatedCells <= 1000);
assert.ok(crop.estimatedCells < state.grid.width * state.grid.height * state.grid.depth);
for (let axis = 0; axis < 3; axis += 1) {
	const dimension = [crop.width, crop.height, crop.depth][axis];
	const coveredMaximum = crop.origin[axis] + (dimension - 1) * crop.cellSize;
	assert.ok(crop.origin[axis] <= crop.bounds.min[axis] + 1e-12);
	assert.ok(coveredMaximum >= crop.bounds.max[axis] - 1e-12);
}

const options = {
	id: "realtime.crop.surface",
	cellSize: 0.1,
	maxCells: 2000,
	maxTriangles: 5000
};
const first = api.createLiquidSurface3d(state, options);
const second = api.createLiquidSurface3d(state, options);
assert.ok(first.geometry.indices.array.length > 0);
assert.ok(first.surfacePlan.estimatedCells <= 2000);
assert.ok(first.surfacePlan.estimatedCells
	< state.grid.width * state.grid.height * state.grid.depth);
assert.deepEqual(first.geometry.indices.array, second.geometry.indices.array);
assert.deepEqual(
	first.geometry.attributes.position.array,
	second.geometry.attributes.position.array
);

console.log('B"H | proceduralObjectCroppedSurface3d.test passed');
