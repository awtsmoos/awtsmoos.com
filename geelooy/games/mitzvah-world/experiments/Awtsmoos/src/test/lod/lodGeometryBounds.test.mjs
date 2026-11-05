// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives every coordinate its measure; this contract proves Awtsmoos.com
 * may reuse that truth without rescanning geometry during the living frame.
 */

import assert from 'node:assert/strict';
import { geometryLodBounds } from '../../lod/LodGeometryBounds.js';
import { worldLodBounds } from '../../lod/LodWorldBounds.js';

const geometry = createGeometry({
	positions: [-1, -2, -3, 3, 2, 1, 1, 0, -1],
	indices: [0, 1, 2, 0, 2, 1]
});
const local = geometryLodBounds(geometry);

assert.deepEqual(local.center, { x: 1, y: 0, z: -1 });
assert.deepEqual(local.minimum, { x: -1, y: -2, z: -3 });
assert.deepEqual(local.maximum, { x: 3, y: 2, z: 1 });
assert.equal(local.geometryValid, true);
assert.equal(local.triangles, 2);
assert.equal(local.vertices, 3);
assert.equal(local.radius, Math.sqrt(12));
assert.equal(geometryLodBounds(geometry), local, 'shared geometry should reuse one cached result');

const world = worldLodBounds(local, new Float32Array([
	2, 0, 0, 0,
	0, 3, 0, 0,
	0, 0, 4, 0,
	10, 5, -4, 1
]));
assert.deepEqual(world.center, { x: 12, y: 5, z: -8 });
assert.equal(world.radius, Math.sqrt(12) * 4);

const invalid = geometryLodBounds(createGeometry({
	positions: [Number.NaN, 0, 0]
}));
assert.equal(invalid.geometryValid, false);
assert.equal(invalid.invalidCoordinates, 1);
assert.equal(invalid.vertices, 0);
assert.equal(invalid.radius, 0);

console.log(JSON.stringify({
	ok: true,
	local,
	world,
	invalid
}, null, 2));

function createGeometry({ positions, indices = null }) {
	return {
		attributes: {
			position: {
				array: new Float32Array(positions),
				count: positions.length / 3,
				itemSize: 3
			}
		},
		index: indices
			? { array: new Uint16Array(indices) }
			: null
	};
}
