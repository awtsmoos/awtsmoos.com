// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalPopulationSilence.test.mjs
 * @description Proves static localhost study is quiet while explicit local and implicit production realtime remain available.
 * The Awtsmoos distinguishes a chosen social wire from a coincidental static host; Awtsmoos.com verifies silence is
 * scoped to implicit same-port localhost configuration and never steals a developer's explicit socket or production census.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	loadMainMenuPopulation,
	resolveMainMenuRealtimeUrl
} from '../../launcher/MainMenuPopulation.js';
import { requestWorldPopulation, resolvePopulationUrl } from '../../network/WorldPopulationClient.js';

const localhost = environment('http://127.0.0.1:5192/games/mitzvah-world/');
const production = environment('https://awtsmoos.com/games/mitzvah-world/');

const CENSUS_PAYLOAD = {
	connected: 2,
	worlds: [
		{ available: true, capacity: 100, connected: 2, description: 'Shared open world', id: 'main-village', region: 'global', tags: ['quests'], title: 'Golden Mountain Village' }
	]
};

test('implicit same-port localhost realtime is intentionally disabled', () => {
	localhost.AwtsmoosRealtimeUrl = 'ws://127.0.0.1:5192/';
	assert.equal(resolveMainMenuRealtimeUrl({ environment: localhost }), null);
});

test('explicit local realtime endpoint remains opt-in and available', () => {
	localhost.AwtsmoosRealtimeUrl = 'ws://127.0.0.1:5192/';
	assert.equal(
		resolveMainMenuRealtimeUrl({ environment: localhost, realtimeUrl: 'ws://127.0.0.1:7001/realtime' }),
		'ws://127.0.0.1:7001/realtime'
	);
});

test('implicit production realtime remains enabled', () => {
	production.AwtsmoosRealtimeUrl = 'wss://awtsmoos.com/realtime';
	assert.equal(resolveMainMenuRealtimeUrl({ environment: production }), 'wss://awtsmoos.com/realtime');
});

test('explicit null prevents global population fallback and socket construction', async () => {
	const previous = globalThis.AwtsmoosRealtimeUrl;
	globalThis.AwtsmoosRealtimeUrl = 'ws://should-not-open.test';
	let constructions = 0;
	class Socket { constructor() { constructions += 1; } }
	try {
		assert.equal(resolvePopulationUrl({ url: null }), null);
		const result = await requestWorldPopulation({ WebSocketClass: Socket, url: null });
		assert.equal(result.available, false);
		assert.equal(constructions, 0);
	} finally {
		globalThis.AwtsmoosRealtimeUrl = previous;
	}
});

test('a hung first census attempt retries once and the menu shows the live population', async () => {
	const behaviours = ['hang', 'answer'];
	const Socket = fakePopulationSocket(behaviours);
	const { menu, state, renders } = fakeMenu();
	await loadMainMenuPopulation(menu, state, {
		WebSocketClass: Socket,
		realtimeUrl: 'wss://awtsmoos.com/',
		retryDelayMs: 0,
		timeoutMs: 50
	}, () => renders.count += 1);
	assert.equal(Socket.constructions, 2);
	assert.equal(state.model.multiplayerAvailable, true);
	assert.equal(state.model.connected, 2);
	assert.equal(menu.summary.textContent, '2 connected');
	assert.equal(renders.count, 1);
});

test('two hung census attempts leave the menu offline after exactly two sockets', async () => {
	const behaviours = ['hang', 'hang'];
	const Socket = fakePopulationSocket(behaviours);
	const { menu, state, renders } = fakeMenu();
	await loadMainMenuPopulation(menu, state, {
		WebSocketClass: Socket,
		realtimeUrl: 'wss://awtsmoos.com/',
		retryDelayMs: 0,
		timeoutMs: 50
	}, () => renders.count += 1);
	assert.equal(Socket.constructions, 2);
	assert.equal(state.model.multiplayerAvailable, false);
	assert.equal(menu.summary.textContent, 'Offline study available');
	assert.equal(renders.count, 1);
});

test('a first-attempt census success is never retried', async () => {
	const behaviours = ['answer'];
	const Socket = fakePopulationSocket(behaviours);
	const { menu, state, renders } = fakeMenu();
	await loadMainMenuPopulation(menu, state, {
		WebSocketClass: Socket,
		realtimeUrl: 'wss://awtsmoos.com/',
		retryDelayMs: 0,
		timeoutMs: 50
	}, () => renders.count += 1);
	assert.equal(Socket.constructions, 1);
	assert.equal(state.model.multiplayerAvailable, true);
	assert.equal(menu.summary.textContent, '2 connected');
});

test('a disconnected menu is never rendered by a late census', async () => {
	const behaviours = ['answer'];
	const Socket = fakePopulationSocket(behaviours);
	const { menu, state, renders } = fakeMenu();
	menu.isConnected = false;
	await loadMainMenuPopulation(menu, state, {
		WebSocketClass: Socket,
		realtimeUrl: 'wss://awtsmoos.com/',
		retryDelayMs: 0,
		timeoutMs: 50
	}, () => renders.count += 1);
	assert.equal(Socket.constructions, 1);
	assert.equal(state.model, undefined);
	assert.equal(renders.count, 0);
});

function environment(href) {
	const location = new URL(href);
	return { location };
}

function fakeMenu() {
	const summary = { textContent: '' };
	const menu = {
		dataset: {},
		isConnected: true,
		querySelector: () => summary,
		summary
	};
	return { menu, renders: { count: 0 }, state: { model: undefined, section: 'worlds' } };
}

// One socket per construction; the test chooses per-attempt behaviour. A hung
// socket never opens, so the population client times out; an answering socket
// opens at once and replies to the census request with the fixed payload.
function fakePopulationSocket(behaviours) {
	let index = 0;
	class FakeSocket {
		static constructions = 0;
		constructor(url) {
			FakeSocket.constructions += 1;
			this.url = url;
			this.readyState = 0;
			this.listeners = new Map();
			this.behaviour = behaviours[Math.min(index, behaviours.length - 1)];
			index += 1;
			if (this.behaviour === 'answer') {
				setTimeout(() => this.open(), 0);
			}
		}
		addEventListener(type, listener) {
			if (!this.listeners.has(type)) this.listeners.set(type, new Set());
			this.listeners.get(type).add(listener);
		}
		removeEventListener(type, listener) {
			this.listeners.get(type)?.delete(listener);
		}
		emit(type, event = {}) {
			for (const listener of [...(this.listeners.get(type) || [])]) listener(event);
		}
		open() {
			this.readyState = 1;
			this.emit('open', { target: this });
		}
		send(raw) {
			if (this.behaviour !== 'answer') return;
			let message;
			try { message = JSON.parse(String(raw)); } catch { return; }
			if (message.type !== 'world.census') return;
			setTimeout(() => this.emit('message', {
				data: JSON.stringify({
					application: 'mitzvah-world',
					payload: CENSUS_PAYLOAD,
					protocol: 'awtsmoos.realtime',
					requestId: message.requestId,
					type: 'world.census',
					version: 1
				}),
				target: this
			}), 0);
		}
		close() {
			this.readyState = 3;
			this.emit('close', { target: this });
		}
	}
	FakeSocket.constructions = 0;
	return FakeSocket;
}
