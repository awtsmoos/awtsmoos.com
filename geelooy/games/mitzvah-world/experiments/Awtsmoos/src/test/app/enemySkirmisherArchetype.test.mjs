// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file enemySkirmisherArchetype.test.mjs
 * @description Proves the road Skirmisher is lean, swift, fragile, light-hitting, and intentionally placed.
 * The Awtsmoos gives swiftness a boundary; Awtsmoos.com lets motion create challenge while
 * a measured road shoulder, mercy, spacing, and the one-attacker covenant preserve clarity.
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

test('B"H Ratz Layla is a road-guided lean skirmisher with wide light pressure', () => {
	const profile = minimalMeadowEnemyProfileById('ratz-layla');
	const station = minimalMeadowRoadEncounterStation('skirmisher');
	const policy = minimalEnemyArchetypePolicy(profile);
	const ranges = minimalEnemyCombatRanges({ actor: { profile } });
	assert.equal(profile.archetype, 'skirmisher');
	assert.equal(profile.biome, 'eastern-road');
	assert.equal(profile.x, station.x);
	assert.equal(profile.z, station.z);
	assert.ok(Math.hypot(profile.x, profile.z) > 25);
	assert.equal(selectMinimalEnemyRole(profile), 'melee');
	assert.ok(profile.speed >= 1.6);
	assert.ok(profile.maxHealth < 80);
	assert.ok(profile.armor <= 2);
	assert.ok(policy.bodyScale[0] < 0.9);
	assert.ok(policy.movementScale > 1.2);
	assert.ok(policy.orbitScale >= 1.5);
	assert.ok(policy.damageScale < 0.7);
	assert.ok(ranges.meleeMaximum < 2.6);
	assert.equal(minimalMeadowPointIsSafe(profile.x, profile.z), true);
	assert.ok(minimalShadowWaypoints(profile).every(point => {
		return minimalMeadowPointIsSafe(point.x, point.z);
	}));
});
