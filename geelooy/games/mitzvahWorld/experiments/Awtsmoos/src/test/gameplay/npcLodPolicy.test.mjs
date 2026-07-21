// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file npcLodPolicy.test.mjs
 * @description Proves animated near bodies, one-draw distance vessels, priority, and bounds.
 * The Awtsmoos renews every named soul beyond visible detail; Awtsmoos.com spends a full
 * Chossid where eyes and dialogue receive him, and one merged silhouette across the valley.
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

test('distance selects complete near detail and merged mid or distant vessels', () => {
	assert.deepEqual(resolveNpcLod(12), {
		fullModel: true,
		id: 'near',
		minimumFrames: 2,
		proxyModel: false,
		updateInterval: 1 / 30
	});
	assert.deepEqual(resolveNpcLod(40), {
		fullModel: false,
		id: 'mid',
		minimumFrames: 6,
		proxyModel: true,
		updateInterval: 1 / 8
	});
	assert.deepEqual(resolveNpcLod(90), {
		fullModel: false,
		id: 'distant',
		minimumFrames: 18,
		proxyModel: true,
		updateInterval: 1 / 3
	});
	assert.equal(resolveNpcLod(170).id, 'dormant');
});

test('selection and dialogue focus restore complete near simulation', () => {
	for (const options of [{ selected: true }, { questFocused: true }]) {
		const focused = resolveNpcLod(999, options);
		assert.equal(focused.id, 'near');
		assert.equal(focused.fullModel, true);
		assert.equal(focused.proxyModel, false);
		assert.equal(focused.minimumFrames, 1);
	}
});

test('distance uses only horizontal world separation', () => {
	const distance = npcDistanceToPlayer(
		{ x: 10, z: -4 },
		{ x: 13, y: 999, z: 0 }
	);
	assert.equal(distance, 5);
});

test('quality tiers preserve all named quest profiles within bounded counts', () => {
	assert.equal(friendlyNpcProfiles('low').length, 3);
	assert.equal(friendlyNpcProfiles('medium').length, 4);
	assert.equal(friendlyNpcProfiles('high').length, 7);
	assert.equal(friendlyNpcProfiles('cinematic').length, 12);
	assert.ok(allFriendlyNpcProfiles().length >= 12);
	assert.equal(friendlyNpcProfiles('low')[0].id, 'reb-mendel');
	assert.ok(friendlyNpcProfiles('medium').every(profile => profile.questId));
	assert.ok(friendlyNpcProfiles('medium').slice(1).every(profile => profile.wanderRadius > 0));
});
