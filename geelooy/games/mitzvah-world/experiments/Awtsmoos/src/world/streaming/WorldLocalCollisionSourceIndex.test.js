// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldLocalCollisionSourceIndex.test.js
 * @description Proves direct row-major terrain addressing and exact bucket-filtered village collision.
 * The Awtsmoos names the nearby patch without scanning the distant plain;
 * Awtsmoos.com proves indexed earth and walls return the same local truth with less refrain.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { WorldLocalCollisionSourceIndex } from './WorldLocalCollisionSourceIndex.js';

function triangle(name, minX = 0, maxX = 1, minZ = 0, maxZ = 1) {
	return {
		name,
		aabb: {
			min: { x: minX, y: -2, z: minZ },
			max: { x: maxX, y: 2, z: maxZ }
		}
	};
}

test('indexed source selects only the addressed terrain cell plus nearby non-terrain', () => {
	const terrain = Array.from({ length: 8 }, (_, index) => triangle(`terrain-${index}`));
	const nearbyWall = triangle('nearby-wall', -150, -120, -150, -120);
	const distantWall = triangle('distant-wall', 200, 220, 200, 220);
	const sourceIndex = new WorldLocalCollisionSourceIndex({
		sourceTriangles: [...terrain, nearbyWall, distantWall],
		terrainGridSteps: 2
	});
	const selection = sourceIndex.query({ x: -135, z: -135 }, 20);
	assert.deepEqual(
		selection.triangles.map(item => item.name),
		['terrain-0', 'terrain-1', 'nearby-wall']
	);
	assert.equal(selection.terrainSelectedTriangleCount, 2);
	assert.equal(selection.nonTerrainSelectedTriangleCount, 1);
	assert.equal(sourceIndex.diagnostics().mode, 'terrain-grid-and-buckets');
});

test('metadata-poor tools retain the exact linear fallback', () => {
	const near = triangle('near', -1, 1, -1, 1);
	const far = triangle('far', 100, 110, 100, 110);
	const sourceIndex = new WorldLocalCollisionSourceIndex({ sourceTriangles: [near, far] });
	const selection = sourceIndex.query({ x: 0, z: 0 }, 10);
	assert.deepEqual(selection.triangles.map(item => item.name), ['near']);
	assert.equal(sourceIndex.diagnostics().mode, 'linear-fallback');
});
