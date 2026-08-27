// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file socketIntegration.test.cjs
 * @description Proves the production client and actual Awtsmoos authority through real frames.
 * The Awtsmoos joins shared travelers, separates distant worlds, and restores one identity;
 * Awtsmoos.com verifies authority rather than replacing it with a mocked message router.
 */

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');
const {
	startMitzvahWorldAuthority,
	waitFor
} = require('./socketIntegrationFixture.cjs');

const clientUrl = pathToFileURL(path.resolve(
	__dirname,
	'../../../../../geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/network/MitzvahWorldRealtimeClient.js'
)).href;

test('B"H real authority preserves shared world, isolation, movement, and reconnect', {
	timeout: 30000
}, async () => {
	const { MitzvahWorldRealtimeClient } = await import(clientUrl);
	const authority = await startMitzvahWorldAuthority();
	try {
		const firstSocket = await authority.open();
		const secondSocket = await authority.open();
		const isolatedSocket = await authority.open();
		const first = new MitzvahWorldRealtimeClient(firstSocket);
		const second = new MitzvahWorldRealtimeClient(secondSocket);
		const isolated = new MitzvahWorldRealtimeClient(isolatedSocket);
		const sharedWorld = `socket-proof-${Date.now()}`;
		await first.join('Server Aleph', sharedWorld);
		await second.join('Server Bet', sharedWorld);
		await isolated.join('Server Gimmel', `${sharedWorld}-isolated`);
		await waitFor(
			() => first.world?.players?.length === 2
				&& second.world?.players?.length === 2,
			'SHARED_WORLD_DISCOVERY'
		);
		assert.equal(isolated.world.players.length, 1);
		assert.notEqual(first.playerId, second.playerId);
		assert.notEqual(first.session.id, second.session.id);
		const revision = second.world.revision;
		await first.input(1, 0, 1.125);
		await waitFor(
			() => second.world?.revision > revision,
			'AUTHORITATIVE_INPUT_BROADCAST'
		);
		const authoritative = second.world.players.find(
			player => player.id === first.playerId
		);
		assert.equal(authoritative.facing, 1.125);
		const playerId = first.playerId;
		const sessionId = first.session.id;
		const resumeToken = first.session.resumeToken;
		firstSocket.close();
		await new Promise(resolve => setTimeout(resolve, 50));
		const resumedSocket = await authority.open();
		const resumed = await first.reconnect(resumedSocket);
		assert.equal(resumed.payload.resumed, true);
		assert.equal(first.playerId, playerId);
		assert.equal(first.session.id, sessionId);
		assert.equal(first.session.resumeToken, resumeToken);
		const heartbeat = await first.heartbeat();
		assert.equal(heartbeat.payload.sessionId, sessionId);
		assert.ok(heartbeat.payload.acknowledgedRevision >= second.world.revision);
	} finally {
		await authority.stop();
	}
});
