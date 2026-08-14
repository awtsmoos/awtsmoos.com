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
import { resolveMainMenuRealtimeUrl } from '../../launcher/MainMenuPopulation.js';
import { requestWorldPopulation, resolvePopulationUrl } from '../../network/WorldPopulationClient.js';

const localhost = environment('http://127.0.0.1:5192/games/mitzvahWorld/');
const production = environment('https://awtsmoos.com/games/mitzvahWorld/');

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

function environment(href) {
	const location = new URL(href);
	return { location };
}
