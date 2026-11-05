// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldTransportHardening.test.mjs
	* @description Proves malformed frames, listener faults, replacement, and closure settle safely.
	* The Awtsmoos measures every wire and failure; Awtsmoos.com verifies
	* finite pending state, stale-event silence, and exact listener cleanup.
	*/

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldTransport } from '../MitzvahWorldTransport.js';

const application = 'mitzvah-world';
const version = 1;

test('malformed frames report errors without throwing', () => {
	const errors = [];
	const socket = createSocket();
	const transport = new MitzvahWorldTransport(
		socket,
		() => {},
		{
			onProtocolError(error) {
				errors.push(error.code);
			}
		}
	);
	assert.equal(transport.receive('{broken'), false);
	assert.deepEqual(errors, ['INVALID_REALTIME_JSON']);
	transport.close();
});

test('listener failure cannot strand a correlated response', async () => {
	const errors = [];
	const socket = createSocket();
	const transport = new MitzvahWorldTransport(
		socket,
		() => {
			throw new Error('consumer failed');
		},
		{
			onProtocolError(error) {
				errors.push(error.message);
			}
		}
	);
	const pending = transport.send('world.join');
	const requestId = JSON.parse(socket.sent[0]).requestId;
	transport.receive(JSON.stringify({
		application,
		payload: { ok: true },
		requestId,
		type: 'world.joined',
		version
	}));
	assert.equal((await pending).payload.ok, true);
	assert.equal(transport.pending.size, 0);
	assert.deepEqual(errors, ['consumer failed']);
	transport.close();
});

test('replacement rejects pending and ignores stale socket events', async () => {
	const first = createSocket();
	const second = createSocket();
	const received = [];
	const transport = new MitzvahWorldTransport(
		first,
		message => received.push(message.type)
	);
	const pending = transport.send('world.join');
	transport.replaceSocket(second);
	await assert.rejects(
		pending,
		error => error.code === 'TRANSPORT_REPLACED'
	);
	first.emit('message', JSON.stringify({
		application,
		type: 'stale',
		version
	}));
	assert.deepEqual(received, []);
	assert.equal(first.listenerCount('message'), 0);
	transport.close();
	assert.equal(second.listenerCount('message'), 0);
});

function createSocket() {
	const listeners = new Map();
	return {
		readyState: 1,
		sent: [],
		addEventListener(type, listener) {
			if (!listeners.has(type)) listeners.set(type, new Set());
			listeners.get(type).add(listener);
		},
		close() {
			this.readyState = 3;
			this.emit('close', {});
		},
		emit(type, data) {
			for (const listener of [...(listeners.get(type) || [])]) {
				listener({ data, target: this });
			}
		},
		listenerCount(type) {
			return listeners.get(type)?.size || 0;
		},
		removeEventListener(type, listener) {
			listeners.get(type)?.delete(listener);
		},
		send(value) {
			this.sent.push(value);
		}
	};
}
