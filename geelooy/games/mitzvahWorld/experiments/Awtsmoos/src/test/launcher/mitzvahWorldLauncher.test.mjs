// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldLauncher.test.mjs
 * @description Proves the launcher invokes only the mode selected by the player or route.
 * The Awtsmoos gives each world its own gate; Awtsmoos.com keeps unchosen heavy systems
 * dormant while the first menu remains a small, truthful, and responsive threshold.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { launchMitzvahWorld } from '../../launcher/MitzvahWorldLauncher.js';

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
	const result = await launchMitzvahWorld(
		hosts,
		'?mode=world&session=singleplayer&quality=low',
		fixture.dependencies
	);

	assert.equal(result, 'singlePlayer-result');
	assert.deepEqual(fixture.modeCalls.map((call) => call.mode), ['singlePlayer']);
	assert.equal(fixture.modeCalls[0].options.quality, 'low');
	assert.deepEqual(fixture.visibilityCalls, [true]);
});

test('movie query invokes only the movie loader with the original search', async () => {
	const fixture = createFixture();
	const search = '?movie=referenceVillage60&autoRender=1';
	const result = await launchMitzvahWorld(hosts, search, fixture.dependencies);

	assert.equal(result, 'movie-result');
	assert.deepEqual(fixture.modeCalls.map((call) => call.mode), ['movie']);
	assert.equal(fixture.modeCalls[0].options.search, search);
});

test('platform route preserves host visibility and avoids world loading', async () => {
	const fixture = createFixture();
	const result = await launchMitzvahWorld(hosts, '?mode=platform', fixture.dependencies);

	assert.equal(result, 'platform-result');
	assert.deepEqual(fixture.modeCalls.map((call) => call.mode), ['platform']);
	assert.deepEqual(fixture.visibilityCalls, [true]);
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
				location: { host: 'example.test', protocol: 'https:' }
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
