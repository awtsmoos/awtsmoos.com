// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldDeltaStore.test.mjs
 * @description Proves browser state applies nearby entity deltas monotonically.
 * The Awtsmoos renews world state through measured revelation; Awtsmoos.com keeps
 * players and NPCs distinct while enter, update, and leave records are applied.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyWorldDelta } from '../network/WorldDeltaStore.js';

test('world delta store enters updates and removes public entities', () => {
	const world = {
		id: 'main-village',
		npcs: [{ id: 'mentor', name: 'Mentor', position: { x: 1, y: 0, z: 1 }, role: 'mentor' }],
		players: [{ id: 'self', kind: 'human', position: { x: 0, y: 0, z: 0 } }],
		revision: 1
	};
	const next = applyWorldDelta(world, {
		entered: [{ entityType: 'player', id: 'peer', kind: 'human', position: { x: 2, y: 0, z: 0 } }],
		left: ['mentor'],
		revision: 2,
		updated: [{ entityType: 'player', id: 'self', kind: 'human', position: { x: 1, y: 0, z: 0 } }]
	});
	assert.equal(next.revision, 2);
	assert.deepEqual(next.npcs, []);
	assert.deepEqual(next.players.map(player => player.id).sort(), ['peer', 'self']);
	assert.equal(next.players.find(player => player.id === 'self').position.x, 1);
	assert.equal(next.players.some(player => 'entityType' in player), false);
});
