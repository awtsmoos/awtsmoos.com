// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mainRiverVillageComposition.test.mjs
 * @description Proves the real Mitzvah World hero village is sparse, inhabited, useful, and still connected to complete canonical life data.
 * The Awtsmoos renews many village identities while two visible homes and four findable neighbors make Awtsmoos.com feel lived rather than cluttered.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { friendlyNpcProfiles } from '../../world/npc/FriendlyNpcProfiles.js';
import { CANONICAL_VILLAGE_HOUSES } from '../../world/village/CanonicalVillageHouses.js';
import { mainRiverVillageHouses } from '../../world/village/MainRiverVillageHouseSelection.js';
import { mainRiverVillageObjectPlan } from '../../world/village/MainRiverVillageObjectPlan.js';

test('hero manifestation keeps two houses while preserving all canonical identities', () => {
	assert.equal(CANONICAL_VILLAGE_HOUSES.length, 18);
	assert.deepEqual(
		mainRiverVillageHouses().map(house => house.id),
		['H27', 'H10']
	);
});

test('medium community accepts six useful objects without overlap rejection', () => {
	const plan = mainRiverVillageObjectPlan('medium');
	assert.deepEqual(plan.structures.map(record => record.id), [
		'hero-house-H27',
		'hero-house-H10'
	]);
	assert.equal(plan.objects.length, 6);
	assert.deepEqual(plan.rejected, []);
});

test('four medium NPCs start nearby while canonical workplaces remain truthful', () => {
	const profiles = friendlyNpcProfiles('medium');
	assert.equal(profiles.length, 4);
	const bridge = profiles.find(profile => profile.questId === 'light-at-river-crossing');
	const east = profiles.find(profile => profile.questId === 'sparks-at-east-gate');
	const shul = profiles.find(profile => profile.questId === 'guard-the-shul');
	assert.equal(bridge.name, 'Bridge Keeper');
	assert.match(bridge.dialogue.greeting, /Bridge Keeper/);
	assert.deepEqual([east.x, east.z], [22, 47]);
	assert.deepEqual([east.workplace.x, east.workplace.z], [4, -44]);
	assert.deepEqual([shul.x, shul.z], [4, 50]);
	assert.deepEqual([shul.workplace.x, shul.workplace.z], [8, -48]);
	assert.equal(east.spawnPolicy.canonicalWorkplacePreserved, true);
});
