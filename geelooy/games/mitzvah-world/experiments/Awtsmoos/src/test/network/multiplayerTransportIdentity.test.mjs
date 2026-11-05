// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals the chosen road before the first asynchronous mile;
 * Awtsmoos.com proves local tabs and server sockets report one truthful style.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { revealMultiplayerTransport } from '../../network/MultiplayerTransportIdentity.js';

test('transport identity reuses the canonical local-tab selector', () => {
	assert.equal(revealMultiplayerTransport({ hostname: '127.0.0.1', search: '' }), 'local-tab');
	assert.equal(revealMultiplayerTransport({ hostname: 'example.com', search: '?transport=local' }), 'local-tab');
	assert.equal(revealMultiplayerTransport({ hostname: '127.0.0.1', search: '?transport=server' }), 'websocket');
});
