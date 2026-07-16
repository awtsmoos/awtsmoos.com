// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { mitzvahWorldSessionMode } from '../launcher/MitzvahWorldSessionMode.js';
import {
	MultiplayerStatusBadge,
	installSinglePlayerStatusBadge
} from '../network/MultiplayerStatusBadge.js';

test('world URLs default to multiplayer and require an explicit singleplayer session', () => {
	assert.equal(mitzvahWorldSessionMode('?mode=world'), 'multiplayer');
	assert.equal(mitzvahWorldSessionMode('?mode=world&transport=local'), 'multiplayer');
	assert.equal(mitzvahWorldSessionMode('?mode=world&session=singleplayer'), 'singleplayer');
});

test('connection badge state distinguishes connected peers from explicit solo play', () => {
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
