// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file interactionCollisionVisualIntegrity.test.mjs
 * @description Guards terrain density, rooted flora, bark, discrete stairs, and role-based surfaces.
 * The Awtsmoos reveals correction through finite contracts; Awtsmoos.com prevents floating growth,
 * open trunks, hidden ramps, wasteful two-sided floors, and disappearing exterior masonry.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installMinimalMeadowHouseSurfacePolicy
} from '../../app/MinimalMeadowHouseSurfacePolicy.js';
import { createMinimalMeadowHouseStairs } from '../../app/MinimalMeadowHouseStairs.js';
import { housePoint } from '../../app/MinimalMeadowHouseMath.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from '../../app/MinimalMeadowHouseProfiles.js';
import {
	minimalMeadowTerrainDensityProfile
} from '../../app/MinimalMeadowTerrainMaterialDensity.js';
import { minimalMeadowTreeTemplate } from '../../app/MinimalMeadowTreeGeometry.js';
import {
	MinimalMeadowVegetationSystem
} from '../../app/MinimalMeadowVegetationSystem.js';
import {
	integrityTreeMaterials,
	integrityVegetationCell
} from './interactionCollisionVisualIntegrityFixture.mjs';

test('B"H terrain profile preserves bounded mobile and richer desktop density', () => {
	const mobile = minimalMeadowTerrainDensityProfile(true);
	const desktop = minimalMeadowTerrainDensityProfile(false);
	assert.deepEqual(mobile, {
		detail: 38,
		grass: 32,
		mobile: true,
		road: 68
	});
	assert.ok(desktop.detail > mobile.detail);
	assert.ok(desktop.grass > mobile.grass);
	assert.ok(desktop.road > mobile.road);
});

test('B"H vegetation cell stays level while wind remains reactive', () => {
	const owner = Object.create(MinimalMeadowVegetationSystem.prototype);
	owner.clock = 2;
	const cell = integrityVegetationCell();
	owner.updateCell(cell, { x: 1.5, z: 1.5 }, 2);
	assert.deepEqual([
		cell.group.quaternion.x,
		cell.group.quaternion.y,
		cell.group.quaternion.z,
		cell.group.quaternion.w
	], [0, 0, 0, 1]);
	assert.ok(cell.group.children.every(child => {
		return child.userData.AwtsmoosYardGrass.rooted;
	}));
});

test('B"H bark is depth-writing and cannot expose reversed branch faces', () => {
	const template = minimalMeadowTreeTemplate(
		'young-oak',
		integrityTreeMaterials(),
		0
	);
	assert.equal(template.bark.material.doubleSided, true);
	assert.equal(template.bark.material.backfaceCull, false);
	assert.equal(template.bark.material.depthWrite, true);
});

test('B"H stairs use discrete tread support and no hidden ramp', () => {
	const profile = MINIMAL_MEADOW_HOUSE_PROFILES.find(item => item.floors > 1);
	const stairs = createMinimalMeadowHouseStairs(
		profile,
		{ floor: { color: '#777777' } },
		0
	);
	assert.equal(stairs.stats.collision, 'discrete-tread-height-sampler');
	assert.equal(stairs.definitions.some(definition => {
		return definition.userData?.role === 'continuous-walkable-stair-ramp';
	}), false);
	const startZ = profile.layout.innerDepth / 2 - 3;
	const first = housePoint(profile, 0, startZ - profile.layout.stairTread * 0.5);
	const third = housePoint(profile, 0, startZ - profile.layout.stairTread * 2.5);
	const firstHeight = stairs.support.heightAt(first.x, first.z, 0);
	const thirdHeight = stairs.support.heightAt(third.x, third.z, firstHeight);
	assert.ok(thirdHeight > firstHeight);
});

test('B"H only thin exterior walls receive reverse faces', () => {
	const exterior = meshFixture('exterior-side-wall');
	const floor = meshFixture('level-interior-floor');
	const exteriorReceipt = installMinimalMeadowHouseSurfacePolicy(exterior);
	const floorReceipt = installMinimalMeadowHouseSurfacePolicy(floor);
	assert.equal(exterior.material.doubleSided, true);
	assert.equal(exterior.frustumCulled, false);
	assert.equal(exteriorReceipt.cameraSafeWall, true);
	assert.equal(floor.material.doubleSided, false);
	assert.equal(floor.material.backfaceCull, true);
	assert.equal(floor.frustumCulled, true);
	assert.equal(floorReceipt.sidedness, 'front');
});

function meshFixture(role) {
	return {
		frustumCulled: true,
		material: { backfaceCull: true, doubleSided: false },
		name: role,
		userData: { role }
	};
}
