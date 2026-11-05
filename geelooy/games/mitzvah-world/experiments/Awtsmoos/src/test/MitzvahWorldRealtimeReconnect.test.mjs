// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldRealtimeReconnect.test.mjs
 * @description Proves browser recovery through the real versioned server router.
 * The Awtsmoos renews transport without erasing the player; this Awtsmoos.com
 * test witnesses one identity, one world, and a fresh socket joined by resync.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldRealtimeClient } from '../network/MitzvahWorldRealtimeClient.js';
import { createBridgeHarness } from './MitzvahWorldClientBridge.mjs';

test('browser client preserves its session and resyncs through a new socket', async () => {
	const harness = createBridgeHarness();
	const firstSocket = harness.createSocket('browser-first');
	const client = new MitzvahWorldRealtimeClient(firstSocket);
	const revisions = [];
	client.onWorld(world => revisions.push(world.revision));

	const joined = await client.join('Browser Shliach');
	const playerId = joined.payload.playerId;
	const sessionId = client.session.id;
	const resumeToken = client.session.resumeToken;
	assert.equal(typeof resumeToken, 'string');
	assert.equal(JSON.stringify(client.world).includes(resumeToken), false);

	await client.input(1, 0, 0);
	const revisionBeforeDisconnect = client.world.revision;
	await firstSocket.disconnect();

	const secondSocket = harness.createSocket('browser-second');
	const resumed = await client.reconnect(secondSocket);
	assert.equal(resumed.payload.playerId, playerId);
	assert.equal(resumed.payload.resumed, true);
	assert.equal(client.session.id, sessionId);
	assert.equal(client.socket, secondSocket);
	assert.equal(client.world.revision >= revisionBeforeDisconnect, true);

	const heartbeat = await client.heartbeat();
	assert.equal(heartbeat.payload.sessionId, sessionId);
	assert.equal(heartbeat.payload.acknowledgedRevision, client.world.revision);

	firstSocket.emit('message', {
		data: JSON.stringify({
			application: 'mitzvah-world',
			payload: { world: { revision: 9999 } },
			type: 'world.changed',
			version: 1
		})
	});
	assert.notEqual(client.world.revision, 9999);
	assert.equal(revisions.length >= 3, true);
});
