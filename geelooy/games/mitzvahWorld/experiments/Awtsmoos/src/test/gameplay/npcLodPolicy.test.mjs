// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file npcLodPolicy.test.mjs
 * @description Proves distance tiers, frame spacing, selection priority, and bounded population.
 * The Awtsmoos renews every distant soul beyond rendered detail; Awtsmoos.com verifies that
 * complete chossid.glb people remain visible while finite update moments follow relevance.
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

test('distance changes complete-body cadence without primitive proxy people', () => {
	assert.deepEqual(resolveNpcLod(12), {
		fullModel: true,
		id: 'near',
		minimumFrames: 2,
		proxyModel: false,
		updateInterval: 1 / 30
	});
	assert.deepEqual(resolveNpcLod(40), {
		fullModel: true,
		id: 'mid',
		minimumFrames: 4,
		proxyModel: false,
		updateInterval: 1 / 10
	});
	assert.deepEqual(resolveNpcLod(90), {
		fullModel: true,
		id: 'distant',
		minimumFrames: 12,
		proxyModel: false,
		updateInterval: 1 / 3
	});
	assert.equal(resolveNpcLod(170).id, 'dormant');
});

test('selection forces complete near simulation every rendered frame', () => {
	const selected = resolveNpcLod(999, { selected: true });
	assert.equal(selected.id, 'near');
	assert.equal(selected.fullModel, true);
	assert.equal(selected.minimumFrames, 1);
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
