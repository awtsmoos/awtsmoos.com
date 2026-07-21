// B"H
// Boruch Hashem
// Blessed is He
/** Isosurface evidence proves indexed extraction, deduplication, orientation, and determinism. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const sphere = api.createSignedDistanceField({
	kind: "sphere",
	parameters: { center: [0, 0, 0], radius: 1 }
});
const grid = api.rasterizeSignedDistanceField(sphere, {
	width: 17, height: 17, depth: 17,
	origin: [-1.6, -1.6, -1.6],
	cellSize: 0.2
});
const first = api.extractMarchingCubesSurface(grid, { id: "sphere.surface" });
const second = api.extractMarchingCubesSurface(grid, { id: "sphere.surface" });
assert.ok(first.indices.count > 0);
assert.ok(first.attributes.position.count > 0);
assert.ok(Math.max(...first.indices.array) < first.attributes.position.count);
assert.ok(first.attributes.position.count < first.indices.count);
assert.deepEqual(first.attributes.position.array, second.attributes.position.array);
assert.deepEqual(first.indices.array, second.indices.array);

let outward = 0;
let measured = 0;
const positions = first.attributes.position.array;
const normals = first.attributes.normal.array;
for (let offset = 0; offset < positions.length; offset += 3) {
	const radius = Math.hypot(positions[offset], positions[offset + 1], positions[offset + 2]);
	if (radius < 0.25) continue;
	measured += 1;
	const dot = positions[offset] * normals[offset]
		+ positions[offset + 1] * normals[offset + 1]
		+ positions[offset + 2] * normals[offset + 2];
	if (dot > 0) outward += 1;
}
assert.ok(outward / measured > 0.9);
const empty = api.extractMarchingCubesSurface(
	api.createScalarGrid3d({ width: 3, height: 3, depth: 3, fill: 1 }),
	{ id: "empty.surface" }
);
assert.equal(empty.indices.count, 0);

console.log('B"H | proceduralObjectMarchingCubes.test passed');
