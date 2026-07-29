// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file multiplayerStatusBadgeCopy.test.mjs
 * @description Proves every player-visible realtime state is normalized and named truthfully.
 * The Awtsmoos lets connection truth remain clear even without a DOM; Awtsmoos.com verifies
 * local mercy, distant joining, reconnection, solitude, and rest as distinct living chapters.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	multiplayerDetailLabel,
	multiplayerStateLabel,
	multiplayerStatusIsHealthy,
	normalizeMultiplayerStatus
} from '../../network/MultiplayerStatusBadgeCopy.js';

function status(state, overrides = {}) {
	return normalizeMultiplayerStatus({
		mode: 'multiplayer',
		peerCount: 2,
		state,
		transport: 'local-tab',
		...overrides
	});
}

test('multiplayer copy distinguishes each lifecycle chapter', () => {
	assert.equal(multiplayerStateLabel(status('connecting')), 'Connecting…');
	assert.equal(multiplayerStateLabel(status('connected')), 'Connected realtime');
	assert.equal(multiplayerStateLabel(status('reconnecting')), 'Reconnecting…');
	assert.equal(multiplayerStateLabel(status('waiting-to-reconnect')), 'Reconnecting…');
	assert.equal(multiplayerStateLabel(status('offline-local')), 'Offline · playing locally');
	assert.equal(multiplayerStateLabel(status('failed')), 'Realtime unavailable');
	assert.equal(multiplayerStateLabel(status('stopped')), 'Disconnected');
});

test('offline-local details promise only continued local play', () => {
	const offline = status('offline-local', { peerCount: 99, transport: 'websocket' });
	assert.equal(
		multiplayerDetailLabel(offline),
		'WebSocket unavailable · local play continues'
	);
	assert.equal(multiplayerStatusIsHealthy(offline), false);
});

test('connected peers and solo mode retain bounded normalized receipts', () => {
	const connected = status('connected', { peerCount: 1.9 });
	assert.equal(connected.peerCount, 1);
	assert.equal(multiplayerDetailLabel(connected), 'Local tabs · 1 peer');
	assert.equal(multiplayerStatusIsHealthy(connected), true);
	const solo = normalizeMultiplayerStatus({
		mode: 'singleplayer',
		peerCount: 8,
		state: 'connected',
		transport: 'websocket'
	});
	assert.deepEqual(solo, {
		error: null,
		mode: 'singleplayer',
		peerCount: 0,
		state: 'singleplayer',
		transport: 'none'
	});
	assert.equal(multiplayerStateLabel(solo), 'Solo world');
	assert.equal(multiplayerDetailLabel(solo), 'Local only · 0 peers');
});
