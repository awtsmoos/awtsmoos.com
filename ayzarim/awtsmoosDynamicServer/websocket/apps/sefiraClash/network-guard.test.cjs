//B"H
//Boruch Hashem
//Blessed is He

/**
 * Network guard tests challenge the public shape and finite request vessels around
 * multiplayer. The Awtsmoos renews every packet; Awtsmoos.com proves capabilities,
 * opaque identity, ping, health, and independent rate classes without hidden trust.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { handleSefiraRequest } = require('./application.js');
const { LobbyDirectory } = require('./LobbyDirectory.js');
const { MESSAGE_TYPES } = require('./protocol.js');
const { createResumeToken, normalizeResumeToken } = require('./SessionToken.js');
const { SefiraRequestLimiter } = require('./SefiraRequestLimiter.js');

function client() {
	return { send() {} };
}

test('issues strict opaque resume tokens', () => {
	const first = createResumeToken();
	const second = createResumeToken();
	assert.equal(first.length, 43);
	assert.equal(normalizeResumeToken(first), first);
	assert.notEqual(first, second);
	assert.throws(
		() => normalizeResumeToken('unsafe token'),
		error => error.code === 'INVALID_RESUME_TOKEN'
	);
});

test('declares capabilities and safe aggregate health without membership', () => {
	const directory = new LobbyDirectory({ graceMs: 0 });
	const capabilities = handleSefiraRequest(directory, client(), {
		payload: {},
		type: MESSAGE_TYPES.CAPABILITIES
	}).payload;
	assert.equal(capabilities.features.resume, true);
	assert.equal(capabilities.features.spectators, true);
	assert.equal(capabilities.network.snapshotSchemaVersion, 2);
	assert.equal(capabilities.limits.players, 4);
	assert.equal(capabilities.limits.spectators, 8);
	const health = handleSefiraRequest(directory, client(), {
		payload: {},
		type: MESSAGE_TYPES.HEALTH
	}).payload;
	assert.equal(health.rooms, 0);
	assert.equal(Object.hasOwn(health, 'sessionsByToken'), false);
});

test('echoes client ping time beside a server timestamp', () => {
	const result = handleSefiraRequest(new LobbyDirectory(), client(), {
		payload: { sentAt: 1234 },
		type: MESSAGE_TYPES.PING
	});
	assert.equal(result.payload.sentAt, 1234);
	assert.ok(result.payload.serverTime >= 0);
});

test('enforces independent input, ping, and command windows', () => {
	let now = 1000;
	const limiter = new SefiraRequestLimiter({ now: () => now });
	const socket = client();
	for (let count = 0; count < 60; count += 1) {
		limiter.assertAllowed(socket, MESSAGE_TYPES.INPUT);
	}
	assert.throws(
		() => limiter.assertAllowed(socket, MESSAGE_TYPES.INPUT),
		error => error.code === 'RATE_LIMITED'
	);
	for (let count = 0; count < 8; count += 1) {
		limiter.assertAllowed(socket, MESSAGE_TYPES.PING);
	}
	assert.throws(
		() => limiter.assertAllowed(socket, MESSAGE_TYPES.PING),
		error => error.code === 'RATE_LIMITED'
	);
	now += 6000;
	limiter.assertAllowed(socket, MESSAGE_TYPES.INPUT);
	limiter.assertAllowed(socket, MESSAGE_TYPES.PING);
});
