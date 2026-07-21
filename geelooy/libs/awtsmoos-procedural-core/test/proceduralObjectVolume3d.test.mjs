// B"H
// Boruch Hashem
// Blessed is He
/** Three-dimensional volume evidence proves sampling, gradients, sparsity, and SDF algebra. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const values = [];
for (let z = 0; z < 3; z += 1) {
	for (let y = 0; y < 3; y += 1) {
		for (let x = 0; x < 3; x += 1) values.push(x + 2 * y + 3 * z);
	}
}
const linear = api.createScalarGrid3d({ width: 3, height: 3, depth: 3, values });
assert.ok(Math.abs(api.sampleScalarGrid3d(linear, [0.5, 1.5, 0.25]) - 4.25) < 1e-12);
assert.deepEqual(api.gradientScalarGrid3d(linear, [1, 1, 1], 1), [1, 2, 3]);

const sparseValues = Array(64).fill(0);
sparseValues[api.gridIndex3d({ width: 4, height: 4 }, 1, 1, 1)] = 5;
const sparse = api.createSparseScalarBrickGrid3dFromDense(
	api.createScalarGrid3d({ width: 4, height: 4, depth: 4, values: sparseValues }),
	{ brickSize: 2, threshold: 0.1 }
);
assert.equal(sparse.bricks.length, 1);
assert.deepEqual(sparse.bricks[0].coordinate, [0, 0, 0]);

const sphere = api.createSignedDistanceField({ kind: "sphere", parameters: { radius: 2 } });
const box = api.createSignedDistanceField({ kind: "box", parameters: { halfSize: [1, 1, 1] } });
assert.equal(api.sampleSignedDistanceField(sphere, [0, 0, 0]), -2);
assert.equal(api.sampleSignedDistanceField(box, [1, 0, 0]), 0);
const shell = api.createSignedDistanceField({ kind: "subtract", children: [
	{ kind: "sphere", parameters: { radius: 2 } },
	{ kind: "sphere", parameters: { radius: 1 } }
] });
assert.ok(api.sampleSignedDistanceField(shell, [0, 0, 0]) > 0);
assert.ok(api.sampleSignedDistanceField(shell, [1.5, 0, 0]) < 0);
const union = api.createSignedDistanceField({ kind: "union", children: [sphere, box] });
assert.equal(api.sampleSignedDistanceField(union, [0, 0, 0]), -2);

console.log('B"H | proceduralObjectVolume3d.test passed');
