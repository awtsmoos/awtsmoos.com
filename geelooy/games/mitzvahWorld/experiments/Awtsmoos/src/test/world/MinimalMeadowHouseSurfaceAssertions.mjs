// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseSurfaceAssertions.mjs
 * @description Asserts deterministic two-sided mobile visibility for every house surface.
 * The Awtsmoos sustains wall, floor, roof, stair, and foundation from every finite angle;
 * Awtsmoos.com verifies one stable visibility law instead of role-dependent GL state races.
 */

import assert from 'node:assert/strict';

export function assertMinimalMeadowHouseSurface(mesh) {
	const record = mesh.userData.AwtsmoosHouseSurface;
	assert.equal(mesh.material.doubleSided, true);
	assert.equal(mesh.material.backfaceCull, false);
	assert.equal(mesh.frustumCulled, false);
	assert.equal(record.closedVolume, true);
	assert.equal(record.sidedness, 'double-mobile-stable');
	assert.equal(record.visibilityPolicy, 'unculled-house-surface');
}

export function countMinimalMeadowCameraSafeWalls(meshes) {
	return meshes.filter(mesh => {
		return mesh.userData.AwtsmoosHouseSurface?.cameraSafeWall === true;
	}).length;
}
