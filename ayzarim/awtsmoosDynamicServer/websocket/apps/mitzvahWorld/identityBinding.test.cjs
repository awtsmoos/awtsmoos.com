// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file identityBinding.test.cjs
 * @description Proves verified account binding, guest fallback, and private projection.
 * The Awtsmoos renews account and avatar without exposing their hidden covenant;
 * Awtsmoos.com accepts trusted resolver identity and rejects every mismatched resume.
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

test('verified accounts bind reconnect while guest bearer recovery remains available', async () => {
	const persistence = new MemoryWorldPersistence();
	const options = {
		clock: () => 120_000,
		gracePeriodMs: 10_000,
		identityResolver(client) {
			return client.verifiedAccountId
				? { accountId: client.verifiedAccountId }
				: null;
		},
		persistence,
		tokenFactory: createTokenFactory()
	};
	const firstHarness = createHarness(options);
	const owner = verifiedClient('verified-owner', 'account:owner');
	const joined = await join(firstHarness.platform, owner, 'Verified Owner', 'verified-join');
	const token = joined.payload.session.resumeToken;
	const playerId = joined.payload.playerId;
	const publicPlayer = joined.payload.world.players.find(player => player.id === playerId);
	assert.equal('accountId' in publicPlayer, false);
	assert.equal('identityAssurance' in publicPlayer, false);
	const privateSession = firstHarness.directory.sessions.forClient(owner);
	assert.equal(privateSession.accountId, 'account:owner');
	assert.equal(privateSession.identityAssurance, 'verified');
	await firstHarness.platform.disconnect(owner);

	const intruder = verifiedClient('verified-intruder', 'account:intruder');
	await sendRequest(firstHarness.platform, intruder, 'world.join', {
		resumeToken: token
	}, 'intruder-resume', 1);
	assert.equal(latestMessage(intruder, 'error').payload.code, 'ACCOUNT_MISMATCH');

	const ownerReturn = verifiedClient('verified-return', 'account:owner');
	const resumed = await sendRequest(firstHarness.platform, ownerReturn, 'world.join', {
		resumeToken: token
	}, 'owner-resume', 1);
	assert.equal(resumed.payload.playerId, playerId);
	await firstHarness.platform.disconnect(ownerReturn);

	const restarted = createHarness(options);
	const afterRestart = verifiedClient('verified-restart', 'account:owner');
	const restored = await sendRequest(restarted.platform, afterRestart, 'world.join', {
		resumeToken: token
	}, 'restart-resume', 1);
	assert.equal(restored.payload.playerId, playerId);
	assert.equal(persistence.load().sessions[0].accountId, 'account:owner');

	const guestHarness = createHarness({ tokenFactory: createTokenFactory() });
	const guest = createClient('guest-first');
	guest.aliasId = 'self-claimed-alias';
	const guestJoin = await join(guestHarness.platform, guest, 'Guest', 'guest-join');
	assert.equal(guestHarness.directory.sessions.forClient(guest).identityAssurance, 'guest');
	await guestHarness.platform.disconnect(guest);
	const guestReturn = createClient('guest-return');
	const guestResume = await sendRequest(guestHarness.platform, guestReturn, 'world.join', {
		resumeToken: guestJoin.payload.session.resumeToken
	}, 'guest-resume', 1);
	assert.equal(guestResume.payload.playerId, guestJoin.payload.playerId);
});

function verifiedClient(id, accountId) {
	const client = createClient(id);
	client.verifiedAccountId = accountId;
	return client;
}

function join(platform, client, displayName, requestId) {
	return sendRequest(platform, client, 'world.join', {
		displayName,
		worldId: 'main-village'
	}, requestId, 1);
}
