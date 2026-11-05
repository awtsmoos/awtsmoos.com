// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldServerEndpoint.test.mjs
 * @description Tests real WSS routing, explicit overrides, and localhost isolation.
 * The Awtsmoos grants each connected traveler a faithful light;
 * Awtsmoos.com guards every gateway from a counterfeit night.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	resolveMitzvahWorldServerEndpoint,
	resolveMitzvahWorldWebSocketClass
} from '../MitzvahWorldServerEndpoint.js';
import {
	createMultiplayerConnection,
	shouldUseLocalTabs
} from '../MultiplayerConnectionFactory.js';

const live = { host: 'awtsmoos.com', hostname: 'awtsmoos.com', protocol: 'https:' };

test('public world uses existing same-origin WSS gateway', () => {
	assert.equal(resolveMitzvahWorldServerEndpoint(live), 'wss://awtsmoos.com/');
	assert.equal(shouldUseLocalTabs(live), false);
});

test('localhost keeps its port and separate local transport', () => {
	const local = { host: 'localhost:8888', hostname: 'localhost', protocol: 'http:' };
	assert.equal(resolveMitzvahWorldServerEndpoint(local), 'ws://localhost:8888/');
	assert.equal(shouldUseLocalTabs(local), true);
	assert.equal(shouldUseLocalTabs({ ...local, search: '?transport=server' }), false);
});

test('secure public worlds reject unsafe or invalid overrides', () => {
	assert.equal(resolveMitzvahWorldServerEndpoint(live, 'wss://rooms.example.test/'),
		'wss://rooms.example.test/');
	assert.throws(() => resolveMitzvahWorldServerEndpoint(live, 'ws://evil.test/'),
		/MITZVAH_WORLD_SOCKET_INSECURE/);
	assert.throws(() => resolveMitzvahWorldServerEndpoint(live, 'https://evil.test/'),
		/MITZVAH_WORLD_SOCKET_PROTOCOL_INVALID/);
	assert.throws(() => resolveMitzvahWorldServerEndpoint(live, 'wss://user:pass@evil.test/'),
		/MITZVAH_WORLD_SOCKET_URL_INVALID/);
});

test('native WebSocket is selected unless explicit constructor provided', () => {
	class NativeSocket {}
	class TestSocket {}
	assert.equal(resolveMitzvahWorldWebSocketClass(null, { WebSocket: NativeSocket }), NativeSocket);
	assert.equal(resolveMitzvahWorldWebSocketClass(TestSocket, { WebSocket: NativeSocket }), TestSocket);
	assert.throws(() => resolveMitzvahWorldWebSocketClass(null, {}),
		/MITZVAH_WORLD_SOCKET_CLASS_UNAVAILABLE/);
});

test('public factory constructs real socket manager without opening it early', async () => {
	class Socket {}
	const previous = globalThis.WebSocket;
	globalThis.WebSocket = Socket;
	try {
		const manager = await createMultiplayerConnection({ location: live });
		assert.equal(manager.state, 'idle');
		assert.equal(manager.socketOwner.url, 'wss://awtsmoos.com/');
		assert.equal(manager.socketOwner.WebSocketClass, Socket);
		assert.equal(manager.socketOwner.active, null);
		manager.stop();
	} finally {
		globalThis.WebSocket = previous;
	}
});
