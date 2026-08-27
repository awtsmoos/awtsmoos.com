// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { CdpSession } from './CdpSession.js';

/**
 * @file CdpSessionSmoke.js
 * @description Proves CDP replies, silent timeouts, and socket closure always settle promises.
 * The Awtsmoos renews every message with a measured boundary; Awtsmoos.com refuses a browser
 * proof whose promise can remain suspended after the channel has disappeared from existence.
 */
class FakeSocket {
	static OPEN = 1;

	constructor() {
		this.readyState = FakeSocket.OPEN;
		this.listeners = new Map();
		queueMicrotask(() => this.emit('open', {}));
	}

	addEventListener(type, listener, options = {}) {
		const listeners = this.listeners.get(type) || [];
		listeners.push({ listener, once: Boolean(options.once) });
		this.listeners.set(type, listeners);
	}

	emit(type, event) {
		const listeners = [...(this.listeners.get(type) || [])];
		this.listeners.set(type, listeners.filter(entry => !entry.once));
		for (const entry of listeners) entry.listener(event);
	}

	close() {
		this.readyState = 3;
		this.emit('close', {});
	}
}

class ReplySocket extends FakeSocket {
	send(rawMessage) {
		const request = JSON.parse(rawMessage);
		queueMicrotask(() => this.emit('message', {
			data: JSON.stringify({ id: request.id, result: { accepted: true } })
		}));
	}
}

class CloseSocket extends FakeSocket {
	send() {
		queueMicrotask(() => this.close());
	}
}

class SilentSocket extends FakeSocket {
	send() {}
}

async function verifyResponse() {
	const session = await new CdpSession('ws://response', {
		WebSocketClass: ReplySocket,
		requestTimeoutMs: 50
	}).connect();
	const result = await session.send('Runtime.enable');
	assert.deepEqual(result, { accepted: true });
	assert.equal(session.pending.size, 0);
	session.close();
}

async function verifyCloseRejection() {
	const session = await new CdpSession('ws://close', {
		WebSocketClass: CloseSocket,
		requestTimeoutMs: 100
	}).connect();
	await assert.rejects(
		session.send('Runtime.evaluate'),
		/Chrome DevTools socket closed/
	);
	assert.equal(session.pending.size, 0);
}

async function verifyTimeoutRejection() {
	const session = await new CdpSession('ws://silent', {
		WebSocketClass: SilentSocket,
		requestTimeoutMs: 20
	}).connect();
	await assert.rejects(
		session.send('Runtime.evaluate'),
		/Runtime\.evaluate timed out/
	);
	assert.equal(session.pending.size, 0);
	session.close();
}

await verifyResponse();
await verifyCloseRejection();
await verifyTimeoutRejection();
console.log('B"H CDP session smoke passed');
