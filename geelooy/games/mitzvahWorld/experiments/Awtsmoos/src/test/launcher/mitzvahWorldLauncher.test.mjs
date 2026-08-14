// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldLauncher.test.mjs
 * @description Proves route isolation and the truthful realtime boundary used by local study versus shared worlds.
 * The Awtsmoos gives each world its own gate; Awtsmoos.com keeps static localhost silent while explicit or
 * non-local realtime vessels remain available without waking any unchosen heavy mode.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	inferRealtimeUrl,
	launchMitzvahWorld,
	resolveRealtimeUrl
} from '../../launcher/MitzvahWorldLauncher.js';

const hosts = Object.freeze({ canvas: { style: {} } });

test('default boot renders the menu without invoking an optional mode', async () => {
	const fixture = createFixture();
	const menu = await launchMitzvahWorld(hosts, '', fixture.dependencies);
	assert.equal(menu, fixture.menu);
	assert.deepEqual(fixture.modeCalls, []);
	assert.equal(fixture.menuCalls.length, 1);
	assert.equal(fixture.menuCalls[0].handlers.singlePlayer instanceof Function, true);
});

test('single-player world invokes only the selected lazy loader', async () => {
	const fixture = createFixture();
	const result = await launchMitzvahWorld(hosts, '?mode=world&session=singleplayer&quality=low', fixture.dependencies);
	assert.equal(result, 'singlePlayer-result');
	assert.deepEqual(fixture.modeCalls.map(call => call.mode), ['singlePlayer']);
	assert.equal(fixture.modeCalls[0].options.quality, 'low');
	assert.deepEqual(fixture.visibilityCalls, [true]);
});

test('movie and platform routes keep unchosen world loading dormant', async () => {
	const movie = createFixture();
	const search = '?movie=referenceVillage60&autoRender=1';
	assert.equal(await launchMitzvahWorld(hosts, search, movie.dependencies), 'movie-result');
	assert.deepEqual(movie.modeCalls.map(call => call.mode), ['movie']);
	assert.equal(movie.modeCalls[0].options.search, search);
	const platform = createFixture();
	assert.equal(await launchMitzvahWorld(hosts, '?mode=platform', platform.dependencies), 'platform-result');
	assert.deepEqual(platform.modeCalls.map(call => call.mode), ['platform']);
	assert.deepEqual(platform.visibilityCalls, [true]);
});

test('static localhost does not invent a websocket endpoint', () => {
	assert.equal(inferRealtimeUrl({ host: '127.0.0.1:5192', hostname: '127.0.0.1', protocol: 'http:' }), null);
	assert.equal(inferRealtimeUrl({ host: 'localhost:5192', hostname: 'localhost', protocol: 'http:' }), null);
	assert.equal(inferRealtimeUrl({ host: 'awtsmoos.com', hostname: 'awtsmoos.com', protocol: 'https:' }), 'wss://awtsmoos.com');
});

test('explicit realtime endpoint still overrides local preview silence', () => {
	const parameters = new URLSearchParams('realtimeUrl=ws%3A%2F%2F127.0.0.1%3A9001');
	const environment = { location: { host: '127.0.0.1:5192', hostname: '127.0.0.1', protocol: 'http:' } };
	assert.equal(resolveRealtimeUrl(parameters, environment), 'ws://127.0.0.1:9001');
});

function createFixture() {
	const menu = Object.freeze({ id: 'menu' });
	const menuCalls = [];
	const modeCalls = [];
	const visibilityCalls = [];
	const modeLoaders = {};
	for (const mode of ['materials', 'movie', 'multiplayer', 'platform', 'singlePlayer']) {
		modeLoaders[mode] = async (receivedHosts, options = {}) => {
			modeCalls.push({ mode, options, receivedHosts });
			return `${mode}-result`;
		};
	}
	return {
		menu,
		menuCalls,
		modeCalls,
		visibilityCalls,
		dependencies: {
			environment: {
				AwtsmoosRealtimeUrl: null,
				WebSocket: class TestWebSocket {},
				location: { host: 'example.test', hostname: 'example.test', protocol: 'https:' }
			},
			modeLoaders,
			setGameHostsVisible(receivedHosts, visible) {
				assert.equal(receivedHosts, hosts);
				visibilityCalls.push(visible);
			},
			showMainMenu(receivedHosts, handlers, options) {
				menuCalls.push({ handlers, options, receivedHosts });
				return menu;
			}
		}
	};
}
