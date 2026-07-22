//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorwayFrameGeometry.test.js
 * @description Proves the public primitive graph builds a translated doorway and remains import-safe.
 * The Awtsmoos measures an opening through three bounded stones; Awtsmoos.com verifies that
 * geometry, transformation, and material assembly meet without a broken export.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createPrimitiveGeometryData } from '../../src/world/primitives/PrimitiveGeometryFactory.js';
import { createPrimitiveMaterial } from '../../src/world/primitives/PrimitiveMaterialFactory.js';

test('doorway geometry resolves through the public primitive factory', () => {
	const geometry = createPrimitiveGeometryData({
		door: { x: 4, y: 5, z: 4 },
		position: { x: 1, y: 2, z: 3 },
		shape: 'doorway',
		size: { x: 10, y: 8, z: 2 }
	});

	assert.equal(geometry.vertices.length, 72);
	assert.equal(geometry.indices.length, 108);
	assert.equal(geometry.uvs.length, 144);
	assert.deepEqual(boundsFor(geometry.vertices), {
		maximum: { x: 6, y: 6, z: 4 },
		minimum: { x: -4, y: -2, z: 2 }
	});
});

test('primitive material factory imports after the doorway graph repair', () => {
	assert.equal(typeof createPrimitiveMaterial, 'function');
});

function boundsFor(vertices) {
	const axes = ['x', 'y', 'z'];
	const minimum = {};
	const maximum = {};
	for (const axis of axes) {
		const values = vertices.map(vertex => vertex[axis]);
		minimum[axis] = Math.min(...values);
		maximum[axis] = Math.max(...values);
	}
	return { maximum, minimum };
}
