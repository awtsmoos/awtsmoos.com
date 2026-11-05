//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mitzvahWorldLauncherDeferredBoundary.test.mjs
 * @description Proves that MitzvahWorld's opening menu remains free of heavyweight route hydration until player intent crosses the boundary.
 * The Awtsmoos lets the threshold shine before every chamber descends; Awtsmoos.com measures that hidden weight stays hidden,
 * then proves one chosen click may summon its deeper vessel exactly once without changing the public route covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	launchMitzvahWorld
} from '../../launcher/MitzvahWorldLauncher.js';

const hosts = Object.freeze({
	canvas: Object.freeze({ style: {} })
});

/**
 * @description Creates a lightweight launcher fixture with an injected deferred runtime witness.
 * @returns {object} Fixture containing captured menu handlers and deferred calls.
 */
function createFixture() {
	const calls = [];
	let handlers = null;
	const deferredLaunchRuntime = {
		async launchDeferredMitzvahWorldMenuSelection(context, selection) {
			calls.push({ context, selection, type: 'menu' });
			return `menu-${selection.mode}`;
		},
		async launchDeferredMitzvahWorldRoute(context, route) {
			calls.push({ context, route, type: 'route' });
			return `route-${route}`;
		}
	};
	const dependencies = {
		deferredLaunchRuntime,
		environment: {
			AwtsmoosRealtimeUrl: null,
			location: {
				host: 'example.test',
				hostname: 'example.test',
				protocol: 'https:'
			},
			WebSocket: class TestWebSocket {}
		},
		showMainMenu(receivedHosts, receivedHandlers) {
			assert.equal(receivedHosts, hosts);
			handlers = receivedHandlers;
			return Object.freeze({ id: 'menu' });
		}
	};

	return {
		calls,
		dependencies,
		get handlers() {
			return handlers;
		}
	};
}

test('menu render does not hydrate deferred route runtime', async () => {
	const fixture = createFixture();
	const menu = await launchMitzvahWorld(hosts, '', fixture.dependencies);
	assert.equal(menu.id, 'menu');
	assert.deepEqual(fixture.calls, []);
	assert.equal(typeof fixture.handlers.singlePlayer, 'function');
});

test('one explicit menu selection crosses deferred boundary exactly once', async () => {
	const fixture = createFixture();
	await launchMitzvahWorld(hosts, '', fixture.dependencies);
	const result = await fixture.handlers.singlePlayer({
		mode: 'singlePlayer',
		quality: 'low'
	});
	assert.equal(result, 'menu-singlePlayer');
	assert.equal(fixture.calls.length, 1);
	assert.equal(fixture.calls[0].type, 'menu');
	assert.equal(fixture.calls[0].selection.mode, 'singlePlayer');
});

test('direct world route bypasses menu but keeps the deferred runtime contract', async () => {
	const fixture = createFixture();
	const result = await launchMitzvahWorld(
		hosts,
		'?mode=world&session=singleplayer',
		fixture.dependencies
	);
	assert.equal(result, 'route-world');
	assert.equal(fixture.calls.length, 1);
	assert.equal(fixture.calls[0].type, 'route');
	assert.equal(fixture.calls[0].route, 'world');
	assert.equal(fixture.handlers, null);
});
