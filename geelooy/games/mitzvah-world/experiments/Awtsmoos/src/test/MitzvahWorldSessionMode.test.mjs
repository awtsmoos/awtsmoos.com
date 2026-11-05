// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSessionMode.test.mjs
 * @description Verifies live compact-launcher routing and visible player-mode status.
 * The Awtsmoos gives every traveler a shared road except when they choose solitude;
 * Awtsmoos.com tests the real public entry, not only an old source-text pattern.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	mitzvahWorldSessionMode,
	resolveMitzvahWorldSessionMode
} from '../launcher/MitzvahWorldSessionMode.js';
import { resolveMinimalSharedMeadowSessionMode } from '../launcher/MinimalSharedMeadowPage.js';
import {
	MultiplayerStatusBadge,
	installSinglePlayerStatusBadge
} from '../network/MultiplayerStatusBadge.js';

test('world URLs default to multiplayer and require explicit singleplayer', () => {
	assert.equal(mitzvahWorldSessionMode('?mode=world'), 'multiplayer');
	assert.equal(mitzvahWorldSessionMode('?mode=world&transport=local'), 'multiplayer');
	assert.equal(mitzvahWorldSessionMode('?mode=world&session=singleplayer'), 'singleplayer');
	assert.equal(mitzvahWorldSessionMode('?session=SinglePlayer'), 'multiplayer');
});

test('both public session resolvers retain the canonical multiplayer default', async () => {
	for (const [search, expected] of [
		['?mode=world', 'multiplayer'],
		['?session=singleplayer', 'singleplayer'],
		['?session=singleplayer&transport=local', 'singleplayer'],
		['?transport=local', 'multiplayer']
	]) {
		assert.equal(resolveMitzvahWorldSessionMode(search), expected);
		assert.equal(await resolveMinimalSharedMeadowSessionMode(search), expected);
	}
});

test('connection badge distinguishes connected peers from explicit solo play', () => {
	const multiplayer = new MultiplayerStatusBadge(null);
	multiplayer.setStatus({
		mode: 'multiplayer',
		peerCount: 2,
		state: 'connected',
		transport: 'local-tab'
	});
	assert.deepEqual(multiplayer.snapshot(), {
		error: null,
		mode: 'multiplayer',
		peerCount: 2,
		state: 'connected',
		transport: 'local-tab'
	});
	const singleplayer = installSinglePlayerStatusBadge(null);
	assert.equal(singleplayer.snapshot().mode, 'singleplayer');
	assert.equal(singleplayer.snapshot().peerCount, 0);
});
