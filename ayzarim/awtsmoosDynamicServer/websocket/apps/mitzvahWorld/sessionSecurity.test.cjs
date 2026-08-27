// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sessionSecurity.test.cjs
 * @description Proves token privacy, active-session exclusion, and revision bounds.
 * The Awtsmoos renews the inward key apart from the public world; Awtsmoos.com
 * rejects malformed or stolen garments while shared snapshots remain secret-free.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	createClient,
	createHarness,
	createTokenFactory,
	latestMessage,
	sendRequest
} = require('./sessionTestSupport.cjs');

test('session secrets and acknowledgements remain server-authoritative', async () => {
	const { platform } = createHarness({ tokenFactory: createTokenFactory() });
	const owner = createClient('owner');
	const joined = await sendRequest(platform, owner, 'world.join', {
		displayName: 'Owner',
		worldId: 'main-village'
	}, 'owner-join', 1);
	const ownerToken = joined.payload.session.resumeToken;

	const malformed = createClient('malformed');
	await sendRequest(platform, malformed, 'world.join', {
		resumeToken: 'not-a-valid-token'
	}, 'malformed-join', 1);
	assert.equal(latestMessage(malformed, 'error').payload.code, 'INVALID_SESSION_TOKEN');

	const thief = createClient('thief');
	await sendRequest(platform, thief, 'world.join', {
		resumeToken: ownerToken
	}, 'thief-join', 1);
	assert.equal(latestMessage(thief, 'error').payload.code, 'SESSION_ACTIVE');

	await sendRequest(platform, owner, 'world.heartbeat', {
		lastAcknowledgedRevision: Number.MAX_SAFE_INTEGER
	}, 'future-heartbeat', 2);
	assert.equal(latestMessage(owner, 'error').payload.code, 'INVALID_REVISION');

	const peer = createClient('peer');
	const peerJoined = await sendRequest(platform, peer, 'world.join', {
		displayName: 'Peer',
		worldId: 'main-village'
	}, 'peer-join', 1);
	const peerToken = peerJoined.payload.session.resumeToken;
	const publicEvents = [...owner.messages, ...peer.messages]
		.filter(message => message.type === 'world.changed');
	assert.equal(publicEvents.length > 0, true);
	for (const event of publicEvents) {
		const serialized = JSON.stringify(event);
		assert.equal(serialized.includes(ownerToken), false);
		assert.equal(serialized.includes(peerToken), false);
	}
});
