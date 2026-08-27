// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowWorldExpansion.test.mjs
 * @description Proves 120-step visuals, 60-step collision, and ten safe outer identities.
 * The Awtsmoos widens the finite stage without thinning visible ground; Awtsmoos.com measures
 * full geometry, bounded collision, exact height truth, unique enemies, and every patrol address.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MINIMAL_MEADOW_ENEMY_PROFILES } from '../../app/MinimalMeadowEnemyProfiles.js';
import { minimalShadowWaypoints } from '../../app/MinimalMeadowEnemyProfile.js';
import { MINIMAL_MEADOW_COLLISION_STEPS } from '../../app/MinimalMeadowTerrainCollisionData.js';
import {
	buildMinimalMeadowTerrainData,
	MINIMAL_MEADOW_SIZE,
	MINIMAL_MEADOW_STEPS
} from '../../app/MinimalMeadowTerrainData.js';
import { minimalMeadowHeightAt } from '../../app/MinimalMeadowTerrainShape.js';
import {
	MINIMAL_MEADOW_WORLD,
	minimalMeadowPointIsSafe
} from '../../app/MinimalMeadowWorldBounds.js';

test('B"H expanded meadow preserves full visuals with bounded collision', () => {
	assert.equal(MINIMAL_MEADOW_WORLD.size, 360);
	assert.equal(MINIMAL_MEADOW_WORLD.steps, 120);
	assert.equal(MINIMAL_MEADOW_SIZE, 360);
	assert.equal(MINIMAL_MEADOW_STEPS, 120);
	assert.equal(MINIMAL_MEADOW_COLLISION_STEPS, 60);
	assert.equal(MINIMAL_MEADOW_SIZE / MINIMAL_MEADOW_STEPS, 3);
	const terrain = buildMinimalMeadowTerrainData();
	assert.equal(terrain.size, 360);
	assert.equal(terrain.steps, 120);
	assert.equal(terrain.vertices.length, 121 * 121);
	assert.equal(terrain.indices.length / 3, 28800);
	assert.equal(terrain.stats.cellWidth, 3);
	assert.equal(terrain.stats.visualTriangles, 28800);
	assert.equal(terrain.stats.collisionSteps, 60);
	assert.equal(terrain.stats.collisionCellWidth, 6);
	assert.equal(terrain.stats.colliderTriangles, 7200);
	assert.equal(terrain.colliders.length, 7200);
	assert.equal(terrain.stats.worldContract.size, 360);
	assert.equal(MINIMAL_MEADOW_ENEMY_PROFILES.length, 10);
	assert.equal(new Set(MINIMAL_MEADOW_ENEMY_PROFILES.map(profile => profile.id)).size, 10);
	assert.equal(MINIMAL_MEADOW_ENEMY_PROFILES.at(-1).id, 'kedem-letter-warden');
	assert.deepEqual(
		MINIMAL_MEADOW_ENEMY_PROFILES.slice(6, 9).map(profile => profile.archetype),
		['warden', 'skirmisher', 'cantor']
	);
	for (const profile of MINIMAL_MEADOW_ENEMY_PROFILES) {
		assert.equal(minimalMeadowPointIsSafe(profile.x, profile.z), true);
		assert.ok(minimalShadowWaypoints(profile).every(point => {
			return minimalMeadowPointIsSafe(point.x, point.z);
		}));
	}
	const outerHeights = [
		minimalMeadowHeightAt(-132, 86),
		minimalMeadowHeightAt(120, -94),
		minimalMeadowHeightAt(108, 108)
	];
	assert.ok(new Set(outerHeights.map(value => value.toFixed(2))).size >= 2);
});
