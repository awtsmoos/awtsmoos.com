//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldBrowserModel.test.mjs
 * @description Proves the launcher offers one recommended simple world, one richer village, and only authoritative multiplayer population truth.
 * The Awtsmoos opens more than one honest road beneath a single sky;
 * Awtsmoos.com lets simple speed and richer depth invite the traveler without inventing a crowd nearby.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createWorldBrowserModel,
	populationLabel
} from '../launcher/WorldBrowserModel.js';

function census(overrides = {}) {
	return {
		available: true,
		connected: 7,
		worlds: [{
			available: true,
			capacity: 16,
			connected: 4,
			description: 'Shared mountain village.',
			id: 'main-village',
			region: 'local',
			tags: ['shared'],
			title: 'Shared Village'
		}],
		...overrides
	};
}

test('local browser exposes Simple Meadow first and Mountain Village second', () => {
	const model = createWorldBrowserModel(census());
	assert.equal(model.localWorlds.length, 2);
	assert.deepEqual(model.localWorlds.map(world => world.id), [
		'simple-meadow',
		'local-reference-village'
	]);
	assert.equal(model.localWorlds[0].title, 'Simple Meadow');
	assert.equal(model.localWorlds[0].recommended, true);
	assert.equal(model.localWorlds[1].title, 'Mountain Village');
	assert.equal(model.localWorlds[1].runtime.canonicalPromotion, true);
});

test('multiplayer browser preserves authoritative census values', () => {
	const model = createWorldBrowserModel(census());
	assert.equal(model.multiplayerAvailable, true);
	assert.equal(model.connected, 7);
	assert.equal(model.multiplayerWorlds[0].connected, 4);
	assert.equal(populationLabel(model), '7 people connected across all worlds');
});

test('unavailable realtime reports reason without fabricating population', () => {
	const model = createWorldBrowserModel({
		available: false,
		reason: 'Realtime endpoint unavailable.',
		worlds: []
	});
	assert.equal(model.connected, null);
	assert.match(populationLabel(model), /Population unavailable/);
	assert.match(populationLabel(model), /Realtime endpoint unavailable/);
});
