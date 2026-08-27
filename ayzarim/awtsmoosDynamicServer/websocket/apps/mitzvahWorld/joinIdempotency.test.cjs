// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file joinIdempotency.test.cjs
 * @description Proves a lost initial join response never creates a second player.
 * The Awtsmoos renews arrival through one private key; this Awtsmoos.com evidence
 * follows that key across transport loss, active exclusion, and process replacement.
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

const JOIN_KEY = 'join-key-00000000000000000000000000000001';

test('join key recovers one player across response loss and restart', async () => {
	const persistence = new MemoryWorldPersistence();
	const options = {
		clock: () => 50_000,
		gracePeriodMs: 10_000,
		persistence,
		tokenFactory: createTokenFactory()
	};
	const firstHarness = createHarness(options);
	const first = createClient('lost-response-transport');
	const joined = await sendRequest(firstHarness.platform, first, 'world.join', {
		displayName: 'Idempotent Shliach',
		joinKey: JOIN_KEY,
		worldId: 'main-village'
	}, 'initial-join', 1);
	await firstHarness.platform.disconnect(first);

	const retry = createClient('retry-transport');
	const retried = await sendRequest(firstHarness.platform, retry, 'world.join', {
		displayName: 'Idempotent Shliach',
		joinKey: JOIN_KEY,
		worldId: 'main-village'
	}, 'retry-join', 1);
	assert.equal(retried.payload.playerId, joined.payload.playerId);
	assert.equal(retried.payload.session.id, joined.payload.session.id);
	assert.equal(retried.payload.resumed, true);
	assert.equal(humanCount(firstHarness.directory), 1);

	const attacker = createClient('active-token-attempt');
	await sendRequest(firstHarness.platform, attacker, 'world.join', {
		displayName: 'Duplicate Attempt',
		joinKey: JOIN_KEY,
		worldId: 'main-village'
	}, 'active-join', 1);
	assert.equal(latestMessage(attacker, 'error').payload.code, 'SESSION_ACTIVE');
	await firstHarness.platform.disconnect(retry);

	const restarted = createHarness(options);
	const afterRestart = createClient('restart-retry');
	const restored = await sendRequest(restarted.platform, afterRestart, 'world.join', {
		displayName: 'Idempotent Shliach',
		joinKey: JOIN_KEY,
		worldId: 'main-village'
	}, 'restart-join', 1);
	assert.equal(restored.payload.playerId, joined.payload.playerId);
	assert.equal(restored.payload.session.id, joined.payload.session.id);
	assert.equal(humanCount(restarted.directory), 1);
});

function humanCount(directory) {
	return [...directory.rooms.get('main-village').players.values()]
		.filter(player => player.kind === 'human').length;
}
