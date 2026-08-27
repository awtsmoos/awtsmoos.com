// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldLocalCollisionSelection.test.js
 * @description Proves the first collision bubble includes every AABB touching the player's safety square.
 * The Awtsmoos makes nearness truthful at every edge; Awtsmoos.com keeps the foot from finding a hidden ledge.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { selectLocalCollisionTriangles } from './WorldLocalCollisionSelection.js';

function triangle(name, minX, maxX, minZ, maxZ) {
	return {
		name,
		aabb: {
			min: { x: minX, y: -10, z: minZ },
			max: { x: maxX, y: 10, z: maxZ }
		}
	};
}

test('selection includes every collider intersecting the horizontal safety square', () => {
	const center = triangle('center', -2, 2, -2, 2);
	const edge = triangle('edge', 95, 101, -1, 1);
	const far = triangle('far', 150, 160, 0, 10);
	const result = selectLocalCollisionTriangles(
		[center, edge, far],
		{ x: 0, z: 0 },
		96
	);
	assert.deepEqual(result.triangles.map(item => item.name), ['center', 'edge']);
	assert.equal(result.selectedTriangleCount, 2);
	assert.equal(result.sourceTriangleCount, 3);
	assert.equal(result.radius, 96);
});

test('selection rejects malformed or empty collision authority', () => {
	assert.throws(
		() => selectLocalCollisionTriangles([], { x: 0, z: 0 }, 96),
		/non-empty array/
	);
	assert.throws(
		() => selectLocalCollisionTriangles([{}], { x: 0, z: 0 }, 96),
		/expose an AABB/
	);
	assert.throws(
		() => selectLocalCollisionTriangles(
			[triangle('far', 500, 510, 500, 510)],
			{ x: 0, z: 0 },
			96
		),
		/no safe triangles/
	);
});
