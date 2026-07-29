// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldMinimap.test.mjs
 * @description Proves historical bounds, solo quest markers, optional peers, and safe preference.
 * The Awtsmoos reveals the same village to one or many travelers; Awtsmoos.com keeps
 * local identity singular, remote identity optional, and every coordinate inside the map square.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	projectWorldMinimap,
	worldMinimapPercentage
} from '../../ui/WorldMinimapProjection.js';
import {
	readWorldMinimapExpanded,
	writeWorldMinimapExpanded
} from '../../ui/WorldMinimapState.js';

test('B"H historical map clamps the village radius to two through ninety-eight percent', () => {
	assert.equal(worldMinimapPercentage(-999), 2);
	assert.equal(worldMinimapPercentage(0), 50);
	assert.equal(worldMinimapPercentage(999), 98);
});

test('B"H solo projection retains player, giver, and active objective markers', () => {
	const runtime = runtimeFixture();
	const projection = projectWorldMinimap(runtime);
	assert.equal(projection.player.label, 'You');
	assert.equal(projection.givers.length, 1);
	assert.equal(projection.givers[0].label, 'Solo Mission');
	assert.equal(projection.objectives.length, 1);
	assert.equal(projection.objectives[0].label, 'Visit the bridge.');
	assert.deepEqual(projection.peers, []);
});

test('B"H multiplayer adds only connected remote peers and excludes local identity', () => {
	const runtime = runtimeFixture();
	runtime.state.multiplayerLocalPlayerId = 'local-player';
	runtime.state.multiplayer = {
		players: [
			{ connected: true, displayName: 'Local', id: 'local-player', position: { x: 1, z: 2 } },
			{ connected: true, displayName: 'Remote', id: 'remote-player', position: { x: 7, z: 8 } },
			{ connected: false, displayName: 'Gone', id: 'gone-player', position: { x: 9, z: 10 } }
		]
	};
	const peers = projectWorldMinimap(runtime).peers;
	assert.equal(peers.length, 1);
	assert.equal(peers[0].label, 'Remote');
});

test('B"H expansion preference defaults compact and survives denied storage', () => {
	const values = new Map();
	const storage = {
		getItem: key => values.get(key) || null,
		setItem: (key, value) => values.set(key, value)
	};
	assert.equal(readWorldMinimapExpanded(storage), false);
	writeWorldMinimapExpanded(storage, true);
	assert.equal(readWorldMinimapExpanded(storage), true);
	assert.equal(readWorldMinimapExpanded({ getItem() { throw new Error('denied'); } }), false);
});

function runtimeFixture() {
	return {
		adventures: {
			snapshot: () => ({
				active: [{
					definition: { name: 'Active Mission' },
					objectiveIndex: 0,
					objectives: [{ description: 'Visit the bridge.', marker: { x: -18, z: 34 } }]
				}],
				available: [{
					definition: {
						giver: { position: { x: 8, z: -48 } },
						name: 'Solo Mission'
					}
				}]
			})
		},
		state: { x: 0, z: 0 }
	};
}
