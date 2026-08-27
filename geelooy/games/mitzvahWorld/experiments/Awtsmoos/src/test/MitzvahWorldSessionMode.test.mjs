// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSessionMode.test.mjs
 * @description Proves multiplayer is canonical while explicit solo travel stays available.
 * The Awtsmoos gives the common road a shared garment; Awtsmoos.com verifies the live meadow
 * imports that one resolver instead of hiding a second single-player default in its doorway.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { mitzvahWorldSessionMode } from '../launcher/MitzvahWorldSessionMode.js';
import {
	MultiplayerStatusBadge,
	installSinglePlayerStatusBadge
} from '../network/MultiplayerStatusBadge.js';

test('world URLs default to multiplayer and require explicit singleplayer', () => {
	assert.equal(mitzvahWorldSessionMode('?mode=world'), 'multiplayer');
	assert.equal(mitzvahWorldSessionMode('?mode=world&transport=local'), 'multiplayer');
	assert.equal(mitzvahWorldSessionMode('?mode=world&session=singleplayer'), 'singleplayer');
});

test('the live meadow page consumes the canonical resolver', () => {
	const pageUrl = new URL('../launcher/MinimalSharedMeadowPage.js', import.meta.url);
	const source = fs.readFileSync(pageUrl, 'utf8');
	assert.match(source, /mitzvahWorldSessionMode\(parameters\)/);
	assert.doesNotMatch(source, /parameters\.get\('session'\) \|\| 'singleplayer'/);
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
