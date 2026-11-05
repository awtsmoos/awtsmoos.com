// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { waitForMitzvahWorldSocketOpen } from '../../network/MitzvahWorldSocketOpen.js';
import { MitzvahWorldTransport } from '../../network/MitzvahWorldTransport.js';

test('socket opening rejects when its deadline expires', async () => {
	const callbacks = [];
	const socket = fakeSocket();
	const opening = waitForMitzvahWorldSocketOpen(socket, {
		cancelSchedule() {},
		schedule(callback) { callbacks.push(callback); return 1; },
		timeoutMs: 10
	});
	callbacks[0]();
	await assert.rejects(opening, error => error.code === 'SOCKET_OPEN_TIMEOUT');
	assert.equal(socket.closed, true);
});

test('realtime request rejects and leaves no pending promise after timeout', async () => {
	const callbacks = [];
	const transport = new MitzvahWorldTransport(fakeSocket(), () => {}, {
		cancelSchedule() {},
		requestTimeoutMs: 10,
		schedule(callback) { callbacks.push(callback); return 1; }
	});
	const request = transport.send('world.join');
	assert.equal(transport.pending.size, 1);
	callbacks[0]();
	await assert.rejects(request, error => error.code === 'REALTIME_REQUEST_TIMEOUT');
	assert.equal(transport.pending.size, 0);
});

function fakeSocket() {
	const listeners = new Map();
	return {
		closed: false,
		readyState: 0,
		addEventListener(type, listener) { listeners.set(type, listener); },
		close() { this.closed = true; },
		removeEventListener(type) { listeners.delete(type); },
		send() {}
	};
}
