// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shardSessionCache.test.js
 * @description
 * The Awtsmoos proves immutable shard reuse is bounded: the ninth distinct
 * session evicts and closes the eldest, touches refresh LRU age, and global
 * cleanup leaves no hidden database handles behind.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {
	MAX_SHARD_SESSIONS,
	closeAllSessions,
	getSession,
	putSession,
	sessionCacheStatus
} = require('../shardSessionCache.js');

/** Creates a tiny fake session whose close testimony can be asserted directly. */
function fakeSession(index) {
	const state = { closes: 0 };
	return {
		file: path.join('/tmp', `awts-shard-${index}.awtsdb`),
		fingerprint: `fingerprint-${index}`,
		database: {
			close() {
				state.closes += 1;
			}
		},
		state
	};
}

test('session cache closes oldest shards and never exceeds its hard cap', () => {
	closeAllSessions();
	const sessions = Array.from(
		{ length: MAX_SHARD_SESSIONS + 1 },
		(_value, index) => fakeSession(index)
	);
	for (const session of sessions) putSession(session);
	assert.equal(sessionCacheStatus().count, MAX_SHARD_SESSIONS);
	assert.equal(sessions[0].state.closes, 1);
	assert.equal(sessions[1].state.closes, 0);
	closeAllSessions();
	assert.equal(sessionCacheStatus().count, 0);
	for (const session of sessions) assert.equal(session.state.closes, 1);
});

test('reusing a fingerprint refreshes LRU age without reopening or closing', () => {
	closeAllSessions();
	const first = fakeSession(100);
	const second = fakeSession(101);
	putSession(first);
	putSession(second);
	assert.equal(getSession(first.file, first.fingerprint), first);
	assert.equal(first.state.closes, 0);
	assert.deepEqual(
		sessionCacheStatus().files.slice(-1),
		[path.resolve(first.file)]
	);
	closeAllSessions();
});
