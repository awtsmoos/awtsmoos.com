// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file enemyCantorArchetype.test.mjs
 * @description Proves the road Cantor is tall, distant, slow-casting, distinct, and intentionally placed.
 * The Awtsmoos gives letters travel without panic; Awtsmoos.com keeps their source visible
 * beside the road, slow enough to evade, light enough to survive, and safely within world bounds.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { minimalEnemyArchetypePolicy } from '../../app/MinimalMeadowEnemyArchetypePolicy.js';
import { minimalEnemyCombatRanges } from '../../app/MinimalMeadowEnemyCombatDecision.js';
import { minimalShadowWaypoints } from '../../app/MinimalMeadowEnemyProfile.js';
import { minimalMeadowEnemyProfileById } from '../../app/MinimalMeadowEnemyProfiles.js';
import { selectMinimalEnemyRole } from '../../app/MinimalMeadowEnemyRolePolicy.js';
import { minimalMeadowRoadEncounterStation } from '../../app/MinimalMeadowRoadEncounterStations.js';
import { minimalMeadowPointIsSafe } from '../../app/MinimalMeadowWorldBounds.js';

test('B"H Baal Otiyot is a road-guided tall cantor with readable ranged pressure', () => {
	const profile = minimalMeadowEnemyProfileById('baal-otiyot');
	const station = minimalMeadowRoadEncounterStation('cantor');
	const policy = minimalEnemyArchetypePolicy(profile);
	const ranges = minimalEnemyCombatRanges({ actor: { profile } });
	assert.equal(profile.archetype, 'cantor');
	assert.equal(profile.biome, 'eastern-road');
	assert.equal(profile.x, station.x);
	assert.equal(profile.z, station.z);
	assert.ok(Math.hypot(profile.x, profile.z) > 25);
	assert.equal(selectMinimalEnemyRole(profile), 'caster');
	assert.equal(profile.attackLetters, 'אות');
	assert.ok(policy.bodyScale[1] >= 1.3);
	assert.ok(policy.casterRangeScale > 1.2);
	assert.ok(policy.projectileSpeedScale < 0.8);
	assert.ok(policy.cooldownScale > 1.4);
	assert.ok(policy.damageScale < 0.75);
	assert.ok(ranges.casterMinimum > 9);
	assert.ok(ranges.casterMaximum > 17);
	assert.equal(minimalMeadowPointIsSafe(profile.x, profile.z), true);
	assert.ok(minimalShadowWaypoints(profile).every(point => {
		return minimalMeadowPointIsSafe(point.x, point.z);
	}));
});
