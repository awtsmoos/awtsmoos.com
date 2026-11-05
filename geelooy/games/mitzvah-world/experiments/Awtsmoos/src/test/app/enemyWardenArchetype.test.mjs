// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file enemyWardenArchetype.test.mjs
 * @description Proves the road Warden is broad, armored, slow, close, merciful, and intentionally placed.
 * The Awtsmoos gives weight without cruelty; Awtsmoos.com makes one guardian readable through
 * silhouette, deliberate pressure, a visible road shoulder, safe patrols, and bounded damage.
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

test('B"H Even Koved is a road-guided broad warden with deliberate melee pressure', () => {
	const profile = minimalMeadowEnemyProfileById('even-koved');
	const station = minimalMeadowRoadEncounterStation('warden');
	const policy = minimalEnemyArchetypePolicy(profile);
	const ranges = minimalEnemyCombatRanges({ actor: { profile } });
	assert.equal(profile.archetype, 'warden');
	assert.equal(profile.biome, 'eastern-road');
	assert.equal(profile.x, station.x);
	assert.equal(profile.z, station.z);
	assert.ok(Math.hypot(profile.x, profile.z) > 25);
	assert.equal(selectMinimalEnemyRole(profile), 'melee');
	assert.ok(profile.maxHealth >= 170);
	assert.ok(profile.armor >= 9);
	assert.ok(policy.bodyScale[0] > 1.2);
	assert.ok(policy.movementScale < 0.9);
	assert.ok(policy.cooldownScale > 1.3);
	assert.ok(policy.damageScale <= 0.9);
	assert.ok(ranges.aggro < 10);
	assert.equal(minimalMeadowPointIsSafe(profile.x, profile.z), true);
	assert.ok(minimalShadowWaypoints(profile).every(point => {
		return minimalMeadowPointIsSafe(point.x, point.z);
	}));
});
