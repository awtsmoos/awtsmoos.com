// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerWorldHardening.test.mjs
	* @description Proves monotonic deltas, entity separation, and census socket cleanup.
	* The Awtsmoos measures every revision and every temporary wire;
	* Awtsmoos.com rejects stale worlds and closes census vessels on cancellation.
	*/

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyWorldDelta } from '../WorldDeltaStore.js';
import { requestWorldPopulation } from '../WorldPopulationClient.js';

test('world deltas reject stale and malformed revisions', () => {
	const world = {
		npcs: [],
		players: [],
		revision: 4
	};
	assert.throws(
		() => applyWorldDelta(world, { revision: 4 }),
		error => error.code === 'STALE_WORLD_DELTA'
	);
	assert.throws(
		() => applyWorldDelta(world, { revision: Number.NaN }),
		error => error.code === 'INVALID_WORLD_REVISION'
	);
	assert.throws(
		() => applyWorldDelta(world, { entered: {}, revision: 5 }),
		error => error.code === 'INVALID_WORLD_DELTA'
	);
});

test('one entity ID cannot remain in both player and NPC rosters', () => {
	const world = {
		npcs: [],
		players: [{ id: 'shared-id', kind: 'human' }],
		revision: 1
	};
	const result = applyWorldDelta(world, {
		entered: [{
			entityType: 'npc',
			id: 'shared-id',
			role: 'merchant'
		}],
		revision: 2
	});
	assert.equal(result.players.length, 0);
	assert.equal(result.npcs.length, 1);
	assert.equal(result.npcs[0].id, 'shared-id');
});

test('cancelled population census closes its unopened socket', async () => {
	const sockets = [];
	class Socket {
		constructor() {
			const socket = createOpeningSocket();
			sockets.push(socket);
			return socket;
		}
	}
	const controller = new AbortController();
	controller.abort();
	const result = await requestWorldPopulation({
		WebSocketClass: Socket,
		signal: controller.signal,
		url: 'ws://example.test'
	});
	assert.equal(result.available, false);
	assert.equal(sockets[0].closeCalls, 1);
});

function createOpeningSocket() {
	return {
		closeCalls: 0,
		readyState: 0,
		addEventListener() {},
		close() {
			this.closeCalls += 1;
			this.readyState = 3;
		},
		removeEventListener() {},
		send() {}
	};
}
