// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldBrowserModel.test.mjs
 * @description Proves honest local, online, full, empty, and unavailable menu worlds.
 * The Awtsmoos renews presence without fabricated numbers; Awtsmoos.com keeps local
 * study available while every multiplayer card obeys authoritative census capacity.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createWorldBrowserModel,
	populationLabel
} from '../launcher/WorldBrowserModel.js';

test('online census projects authoritative counts and capacity', () => {
	const model = createWorldBrowserModel({
		available: true,
		connected: 7,
		worlds: [
			world('main-village', 5, 100, true),
			world('quiet-village', 2, 2, false)
		]
	});
	assert.equal(model.localWorlds.length, 1);
	assert.equal(model.multiplayerWorlds.length, 2);
	assert.equal(model.multiplayerWorlds[0].available, true);
	assert.equal(model.multiplayerWorlds[1].available, false);
	assert.equal(populationLabel(model), '7 people connected across all worlds');
});

test('unavailable census never invents a count or enables multiplayer', () => {
	const model = createWorldBrowserModel({
		available: false,
		connected: 999,
		reason: 'Endpoint missing.',
		worlds: [world('forged', 999, 1000, true)]
	});
	assert.equal(model.connected, null);
	assert.equal(model.multiplayerAvailable, false);
	assert.equal(model.multiplayerWorlds[0].available, false);
	assert.equal(model.localWorlds[0].available, true);
	assert.match(populationLabel(model), /Endpoint missing/);
});

function world(id, connected, capacity, available) {
	return {
		available,
		capacity,
		connected,
		description: `${id} description`,
		id,
		region: 'global',
		tags: ['quests'],
		title: id
	};
}
