// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file npcLodPolicy.test.mjs
 * @description Proves distance tiers, selection priority, and quality-bounded population.
 * The Awtsmoos renews every distant soul beyond rendered detail; Awtsmoos.com verifies
 * that simulation cost follows interest while named Shlichus identity remains explicit.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	npcDistanceToPlayer,
	resolveNpcLod
} from '../../world/npc/NpcLodPolicy.js';
import {
	allFriendlyNpcProfiles,
	friendlyNpcProfiles
} from '../../world/npc/FriendlyNpcProfiles.js';

test('distance changes skeletal cadence without substituting primitive proxy people', () => {
	assert.deepEqual(resolveNpcLod(12), {
		fullModel: true,
		id: 'near',
		proxyModel: false,
		updateInterval: 1 / 30
	});
	assert.equal(resolveNpcLod(40).id, 'mid');
	assert.deepEqual(resolveNpcLod(90), {
		fullModel: true,
		id: 'distant',
		proxyModel: false,
		updateInterval: 1 / 6
	});
	assert.equal(resolveNpcLod(170).id, 'dormant');
});

test('selection forces full near simulation regardless of distance', () => {
	const selected = resolveNpcLod(999, { selected: true });
	assert.equal(selected.id, 'near');
	assert.equal(selected.fullModel, true);
});

test('distance uses only horizontal world separation', () => {
	const distance = npcDistanceToPlayer(
		{ x: 10, z: -4 },
		{ x: 13, y: 999, z: 0 }
	);
	assert.equal(distance, 5);
});

test('quality tiers bound named friendly actor counts without primitive substitutes', () => {
	assert.equal(friendlyNpcProfiles('low').length, 3);
	assert.equal(friendlyNpcProfiles('medium').length, 4);
	assert.equal(friendlyNpcProfiles('high').length, 7);
	assert.equal(friendlyNpcProfiles('cinematic').length, 12);
	assert.ok(allFriendlyNpcProfiles().length >= 12);
	assert.equal(friendlyNpcProfiles('low')[0].id, 'reb-mendel');
	assert.ok(friendlyNpcProfiles('medium').every(profile => profile.questId));
	assert.ok(friendlyNpcProfiles('medium').slice(1).every(profile => profile.wanderRadius > 0));
});
