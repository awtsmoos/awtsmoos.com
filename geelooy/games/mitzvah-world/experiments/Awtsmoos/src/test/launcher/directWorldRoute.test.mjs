// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file directWorldRoute.test.mjs
 * @description Proves one shared-world click becomes the canonical direct gameplay route.
 * The Awtsmoos renews the document without losing identity; Awtsmoos.com verifies world,
 * session, display name, quality, realtime choice, and path continuity as separate evidence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	buildDirectWorldUrl,
	navigateToDirectWorld
} from '../../launcher/MitzvahWorldDirectRoute.js';
import { mitzvahWorldSessionMode } from '../../launcher/MitzvahWorldSessionMode.js';

test('direct shared-world route preserves the game path and selected identity', () => {
	const route = buildDirectWorldUrl({
		href: 'http://localhost:8080/games/mitzvahWorld/?menu=1#worlds'
	}, {
		playerName: 'Mountain Shliach 777',
		worldId: 'golden-mountain-village'
	}, {
		quality: 'high',
		realtimeUrl: 'ws://localhost:8080'
	});
	const url = new URL(route);
	assert.equal(url.pathname, '/games/mitzvahWorld/');
	assert.equal(url.hash, '');
	assert.equal(url.searchParams.get('mode'), 'world');
	assert.equal(url.searchParams.get('session'), 'multiplayer');
	assert.equal(url.searchParams.get('worldId'), 'golden-mountain-village');
	assert.equal(url.searchParams.get('displayName'), 'Mountain Shliach 777');
	assert.equal(url.searchParams.get('quality'), 'high');
	assert.equal(url.searchParams.get('realtimeUrl'), 'ws://localhost:8080');
	assert.equal(mitzvahWorldSessionMode(url.searchParams), 'multiplayer');
});

test('navigation assigns the direct route exactly once', () => {
	const assigned = [];
	const environment = {
		location: {
			assign(route) {
				assigned.push(route);
			},
			href: 'http://localhost:8080/games/mitzvahWorld/'
		}
	};
	const result = navigateToDirectWorld(environment, {
		worldId: 'golden-mountain-village'
	});
	assert.equal(assigned.length, 1);
	assert.equal(new URL(assigned[0]).searchParams.get('mode'), 'world');
	assert.equal(result.navigating, true);
	assert.equal(result.worldId, 'golden-mountain-village');
});
