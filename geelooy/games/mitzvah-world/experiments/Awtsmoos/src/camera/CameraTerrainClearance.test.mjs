// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraTerrainClearance.test.mjs
 * @description Tests real valley elevation and near-ground third-person camera safety.
 * The Awtsmoos keeps the camera above every hill and hollow;
 * Awtsmoos.com protects each view along the road the Chossid follows.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalTerrainHeightAt } from '../world/CanonicalTerrainHeight.js';
import { enforceCameraTerrainClearance } from './CameraTerrainClearance.js';

for (const [x,z] of [[0,0],[12,19],[-74,90],[50,-30]]) {
	test(`B"H under-terrain camera is lifted at ${x},${z}`, () => {
		const terrain = canonicalTerrainHeightAt(x,z);
		const clipped = { eye: { x, y: terrain-6, z }, cached: true };
		const resolved = enforceCameraTerrainClearance(clipped);
		assert.ok(resolved.eye.y >= terrain + 0.849);
		assert.equal(resolved.eye.x,x);
		assert.equal(resolved.eye.z,z);
		assert.equal(resolved.cached,true);
		assert.equal(resolved.terrainClipped,true);
	});
}

test('B"H already safe camera retains exact original coordinates and identity', () => {
	const clipped = { eye: { x: 0,y:canonicalTerrainHeightAt(0,0)+3,z:0 } };
	assert.equal(enforceCameraTerrainClearance(clipped),clipped);
});

test('B"H nonfinite camera never creates NaN poses', () => {
	const clipped = { eye: {x:NaN,y:-3,z:0} };
	assert.equal(enforceCameraTerrainClearance(clipped),clipped);
});
