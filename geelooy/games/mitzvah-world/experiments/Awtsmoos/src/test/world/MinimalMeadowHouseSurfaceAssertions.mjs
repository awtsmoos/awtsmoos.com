// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseSurfaceAssertions.mjs
 * @description Asserts reverse faces only for thin exterior walls and bounded front faces elsewhere.
 * The Awtsmoos sustains each architectural role through its fitting visibility law; Awtsmoos.com
 * keeps walls camera-safe without turning floors, roofs, landings, and foundations inside out.
 */

import assert from 'node:assert/strict';

export function assertMinimalMeadowHouseSurface(mesh) {
	const record = mesh.userData.AwtsmoosHouseSurface;
	assert.equal(record.closedVolume, true);
	if (record.cameraSafeWall) {
		assert.equal(mesh.material.doubleSided, true);
		assert.equal(mesh.material.backfaceCull, false);
		assert.equal(mesh.frustumCulled, false);
		assert.equal(record.sidedness, 'double-mobile-stable');
		assert.equal(record.visibilityPolicy, 'unculled-camera-safe-wall');
		return;
	}
	assert.equal(mesh.material.doubleSided, false);
	assert.equal(mesh.material.backfaceCull, true);
	assert.equal(mesh.frustumCulled, true);
	assert.equal(record.sidedness, 'front');
	assert.equal(record.visibilityPolicy, 'bounded-front-surface');
}

export function countMinimalMeadowCameraSafeWalls(meshes) {
	return meshes.filter(mesh => {
		return mesh.userData.AwtsmoosHouseSurface?.cameraSafeWall === true;
	}).length;
}
