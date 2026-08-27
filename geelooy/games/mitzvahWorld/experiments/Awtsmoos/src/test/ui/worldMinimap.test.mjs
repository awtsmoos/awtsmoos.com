// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldMinimap.test.mjs
 * @description Proves bounds, solo and peer markers, safe preference, and one stable DOM identity.
 * The Awtsmoos reveals the same village to one or many travelers through one named map;
 * Awtsmoos.com keeps every coordinate bounded and every browser proof anchored to living truth.
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
import {
	createWorldMinimapRoot
} from '../../ui/WorldMinimapView.js';

test('B"H historical map clamps village coordinates', () => {
	assert.equal(worldMinimapPercentage(-999), 2);
	assert.equal(worldMinimapPercentage(0), 50);
	assert.equal(worldMinimapPercentage(999), 98);
});

test('B"H solo projection retains player, giver, and objective markers', () => {
	const projection = projectWorldMinimap(runtimeFixture());
	assert.equal(projection.player.label, 'You');
	assert.equal(projection.givers.length, 1);
	assert.equal(projection.givers[0].label, 'Solo Mission');
	assert.equal(projection.objectives.length, 1);
	assert.equal(projection.objectives[0].label, 'Visit the bridge.');
	assert.deepEqual(projection.peers, []);
});

test('B"H multiplayer includes only connected remote peers', () => {
	const runtime = runtimeFixture();
	runtime.state.multiplayerLocalPlayerId = 'local-player';
	runtime.state.multiplayer = {
		players: [
			peer('local-player', 'Local', true, 1, 2),
			peer('remote-player', 'Remote', true, 7, 8),
			peer('gone-player', 'Gone', false, 9, 10)
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
	assert.equal(readWorldMinimapExpanded(deniedStorage()), false);
});

test('B"H minimap root exposes one stable browser diagnostic identity', () => {
	const root = createWorldMinimapRoot(fakeDocument(), 'expanded');
	assert.equal(root.className, 'Awtsmoos-minimap Awtsmoos-gameplay');
	assert.equal(root.dataset.worldMinimap, 'true');
	assert.equal(root.dataset.mode, 'expanded');
	assert.equal(root.dataset.expanded, 'true');
	assert.match(root.innerHTML, /data-map/);
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

function peer(id, displayName, connected, x, z) {
	return { connected, displayName, id, position: { x, z } };
}

function deniedStorage() {
	return { getItem() { throw new Error('denied'); } };
}

function fakeDocument() {
	return {
		createElement(tagName) {
			return {
				className: '',
				dataset: {},
				innerHTML: '',
				tagName: tagName.toUpperCase()
			};
		}
	};
}
