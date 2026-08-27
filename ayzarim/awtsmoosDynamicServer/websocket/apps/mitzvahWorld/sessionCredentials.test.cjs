// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sessionCredentials.test.cjs
 * @description Proves rotation invalidates old tokens and revocation removes identity.
 * The Awtsmoos renews a private credential without multiplying the player;
 * Awtsmoos.com verifies the former key dies before the replacement may reconnect.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { MemoryWorldPersistence } = require('./MemoryWorldPersistence.js');
const {
	createClient,
	createHarness,
	createTokenFactory,
	latestMessage,
	sendRequest
} = require('./sessionTestSupport.cjs');

test('session rotates and revokes through the public versioned router', async () => {
	const persistence = new MemoryWorldPersistence();
	const options = {
		clock: () => 90_000,
		gracePeriodMs: 10_000,
		persistence,
		tokenFactory: createTokenFactory()
	};
	const firstHarness = createHarness(options);
	const first = createClient('credential-owner');
	const joined = await sendRequest(firstHarness.platform, first, 'world.join', {
		displayName: 'Credential Shliach',
		joinKey: 'join-key-credential-000000000000000001',
		worldId: 'main-village'
	}, 'credential-join', 1);
	const oldToken = joined.payload.session.resumeToken;
	const playerId = joined.payload.playerId;
	const sessionId = joined.payload.session.id;

	const rotated = await sendRequest(
		firstHarness.platform,
		first,
		'session.rotate',
		{},
		'credential-rotate',
		2
	);
	const newToken = rotated.payload.session.resumeToken;
	assert.notEqual(newToken, oldToken);
	assert.equal(rotated.payload.session.id, sessionId);

	const oldAttempt = createClient('old-token-attempt');
	await sendRequest(firstHarness.platform, oldAttempt, 'world.join', {
		resumeToken: oldToken
	}, 'old-token-join', 1);
	assert.equal(latestMessage(oldAttempt, 'error').payload.code, 'SESSION_EXPIRED');
	await firstHarness.platform.disconnect(first);

	const restarted = createHarness(options);
	const resumed = createClient('rotated-resume');
	const resumedResponse = await sendRequest(restarted.platform, resumed, 'world.join', {
		resumeToken: newToken
	}, 'rotated-join', 1);
	assert.equal(resumedResponse.payload.playerId, playerId);
	assert.equal(resumedResponse.payload.session.id, sessionId);

	const revoked = await sendRequest(
		restarted.platform,
		resumed,
		'session.revoke',
		{},
		'credential-revoke',
		2
	);
	assert.equal(revoked.payload.revoked, true);
	assert.equal(revoked.payload.playerId, playerId);
	assert.equal(restarted.directory.rooms.size, 0);

	const revokedAttempt = createClient('revoked-token-attempt');
	await sendRequest(restarted.platform, revokedAttempt, 'world.join', {
		resumeToken: newToken
	}, 'revoked-token-join', 1);
	assert.equal(latestMessage(revokedAttempt, 'error').payload.code, 'SESSION_EXPIRED');
});
