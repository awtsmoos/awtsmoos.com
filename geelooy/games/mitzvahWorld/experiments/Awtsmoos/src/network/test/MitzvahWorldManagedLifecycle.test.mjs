// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldManagedLifecycle.test.mjs
	* @description Proves opening cancellation and repeated start cannot multiply sockets.
	* The Awtsmoos preserves one traveler through many possible wires; Awtsmoos.com
	* verifies abandoned generations close and no duplicate doorway remains alive.
	*/

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldManagedConnection } from '../MitzvahWorldManagedConnection.js';
import { waitForMitzvahWorldSocketOpen } from '../MitzvahWorldSocketOpen.js';

test('already-aborted and already-closed sockets reject deterministically', async () => {
	const controller = new AbortController();
	controller.abort();
	const aborted = createSocket(0);
	await assert.rejects(
		waitForMitzvahWorldSocketOpen(aborted, {
			signal: controller.signal
		}),
		error => error.code === 'SOCKET_OPEN_ABORTED'
	);
	assert.equal(aborted.closeCalls, 1);
	await assert.rejects(
		waitForMitzvahWorldSocketOpen(createSocket(3)),
		error => error.code === 'SOCKET_ALREADY_CLOSED'
	);
});

test('repeated start shares one opening and stop aborts it', async () => {
	const sockets = [];
	class Socket {
		constructor() {
			const socket = createSocket(0);
			sockets.push(socket);
			return socket;
		}
	}
	const manager = new MitzvahWorldManagedConnection({
		WebSocketClass: Socket,
		openTimeoutMs: 0,
		url: 'ws://example.test'
	});
	const first = manager.start('Alef');
	const second = manager.start('Alef');
	assert.equal(first, second);
	assert.equal(sockets.length, 1);
	manager.stop();
	await assert.rejects(
		first,
		error => error.name === 'AbortError'
	);
	assert.equal(sockets[0].closeCalls > 0, true);
	assert.equal(manager.state, 'stopped');
});

function createSocket(readyState) {
	const listeners = new Map();
	return {
		closeCalls: 0,
		readyState,
		addEventListener(type, listener) {
			if (!listeners.has(type)) {
				listeners.set(type, new Set());
			}
			listeners.get(type).add(listener);
		},
		close() {
			this.closeCalls += 1;
			this.readyState = 3;
			for (const listener of [...(listeners.get('close') || [])]) {
				listener({ target: this });
			}
		},
		removeEventListener(type, listener) {
			listeners.get(type)?.delete(listener);
		},
		send() {}
	};
}
