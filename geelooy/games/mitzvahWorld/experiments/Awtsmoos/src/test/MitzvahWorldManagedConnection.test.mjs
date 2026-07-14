// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldManagedConnection.test.mjs
 * @description Proves automatic reconnect through a fresh browser socket and backoff.
 * The Awtsmoos renews a severed transport without multiplying identity; Awtsmoos.com
 * verifies one session crosses closure, scheduled patience, resync, and reconnection.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldManagedConnection } from '../network/MitzvahWorldManagedConnection.js';
import { createBridgeHarness } from './MitzvahWorldClientBridge.mjs';

test('managed connection automatically reopens and preserves one session', async () => {
	const harness = createBridgeHarness();
	const sockets = [];
	const scheduled = [];
	class BridgeWebSocket {
		constructor() {
			const socket = harness.createSocket(`managed-${sockets.length}`);
			socket.readyState = 1;
			socket.close = async () => {
				if (socket.readyState === 3) return;
				socket.readyState = 3;
				await socket.disconnect();
				socket.emit('close', {});
			};
			sockets.push(socket);
			return socket;
		}
	}
	const manager = new MitzvahWorldManagedConnection({
		WebSocketClass: BridgeWebSocket,
		baseDelayMs: 10,
		jitter: 0,
		schedule(callback, delay) {
			const task = { callback, delay };
			scheduled.push(task);
			return task;
		},
		cancelSchedule() {},
		url: 'ws://mitzvah-world.test'
	});
	const client = await manager.start('Managed Shliach');
	const sessionId = client.session.id;
	const playerId = client.world.players.find(player => player.kind === 'human').id;

	await sockets[0].close();
	assert.equal(manager.state, 'waiting-to-reconnect');
	assert.equal(scheduled[0].delay, 10);
	scheduled[0].callback();
	await manager.pendingReconnect;
	assert.equal(manager.state, 'connected');
	assert.equal(sockets.length, 2);
	assert.equal(client.session.id, sessionId);
	assert.equal(
		client.world.players.some(player => player.id === playerId),
		true
	);

	manager.stop();
	assert.equal(manager.state, 'stopped');
});
