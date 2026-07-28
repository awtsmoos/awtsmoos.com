// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file interactionCollisionVisualIntegrity.test.mjs
 * @description Guards broad terrain, rooted flora, bark, stairs, and deterministic house surfaces.
 * The Awtsmoos reveals correction through direct finite contracts; Awtsmoos.com prevents
 * floating growth, open trunks, blocked stairs, tiled ground, and disappearing masonry.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installMinimalMeadowHouseSurfacePolicy
} from '../../app/MinimalMeadowHouseSurfacePolicy.js';
import {
	createMinimalMeadowHouseStairs
} from '../../app/MinimalMeadowHouseStairs.js';
import {
	MINIMAL_MEADOW_HOUSE_PROFILES
} from '../../app/MinimalMeadowHouseProfiles.js';
import {
	minimalMeadowTerrainDensityProfile
} from '../../app/MinimalMeadowTerrainMaterialDensity.js';
import {
	minimalMeadowTreeTemplate
} from '../../app/MinimalMeadowTreeGeometry.js';
import {
	MinimalMeadowVegetationSystem
} from '../../app/MinimalMeadowVegetationSystem.js';
import {
	integrityTreeMaterials,
	integrityVegetationCell
} from './interactionCollisionVisualIntegrityFixture.mjs';

test('B"H terrain profile favors broad full-source coverage', () => {
	assert.deepEqual(minimalMeadowTerrainDensityProfile(true), {
		detail: 10,
		grass: 12,
		mobile: true,
		road: 14
	});
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

test('B"H stairs own a continuous invisible walkable ramp', () => {
	const stairs = createMinimalMeadowHouseStairs(
		MINIMAL_MEADOW_HOUSE_PROFILES[0],
		{ floor: { color: '#777777' } },
		0
	);
	const ramp = stairs.definitions.find(definition => {
		return definition.userData?.role
			=== 'continuous-walkable-stair-ramp';
	});
	assert.ok(ramp);
	assert.equal(ramp.shape, 'manual');
	assert.equal(ramp.visible, false);
	assert.equal(ramp.walkable, true);
	assert.equal(stairs.stats.collision, 'continuous-walkable-ramp');
});

test('B"H every house surface uses deterministic two-sided visibility', () => {
	const mesh = {
		frustumCulled: true,
		material: { backfaceCull: true, doubleSided: false },
		name: 'foundation-side',
		userData: { role: 'foundation-side' }
	};
	const receipt = installMinimalMeadowHouseSurfacePolicy(mesh);
	assert.equal(mesh.frustumCulled, false);
	assert.equal(mesh.material.doubleSided, true);
	assert.equal(mesh.material.backfaceCull, false);
	assert.equal(receipt.sidedness, 'double-mobile-stable');
});
