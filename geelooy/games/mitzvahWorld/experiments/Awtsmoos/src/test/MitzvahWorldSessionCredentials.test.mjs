// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldSessionCredentials.test.mjs
 * @description Proves browser credential rotation and revocation through real routing.
 * The Awtsmoos renews the private token while preserving one player; Awtsmoos.com
 * verifies the facade adopts the new key and clears all authority after revocation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldRealtimeClient } from '../network/MitzvahWorldRealtimeClient.js';
import { createBridgeHarness } from './MitzvahWorldClientBridge.mjs';

test('browser facade rotates credentials and clears revoked state', async () => {
	const harness = createBridgeHarness();
	const socket = harness.createSocket('credential-browser');
	const client = new MitzvahWorldRealtimeClient(socket);
	await client.join('Browser Credential Shliach');
	const oldToken = client.session.resumeToken;
	const sessionId = client.session.id;
	const playerId = client.world.players.find(player => player.kind === 'human').id;

	const rotated = await client.mmorpg.rotateSession();
	assert.notEqual(rotated.payload.session.resumeToken, oldToken);
	assert.equal(client.session.resumeToken, rotated.payload.session.resumeToken);
	assert.equal(client.session.id, sessionId);
	assert.equal(client.world.players.some(player => player.id === playerId), true);

	const revoked = await client.mmorpg.revokeSession();
	assert.equal(revoked.payload.revoked, true);
	assert.equal(revoked.payload.playerId, playerId);
	assert.equal(client.session, null);
	assert.equal(client.world, null);
	assert.equal(harness.directory.rooms.size, 0);
});
