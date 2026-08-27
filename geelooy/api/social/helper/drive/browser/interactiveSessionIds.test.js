//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves interactive browser identity stays opaque, bounded, and stable where intended.
 * @description The Awtsmoos gives each session a hidden name while Awtsmoos.com hashes the owner flame;
 * user and jar remain distinct in the profile vessel, yet neither becomes a filesystem name.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	assertInteractiveSessionId,
	createInteractiveSessionId,
	interactiveOwnerKey,
	normalizeInteractiveJarId
} = require('./interactiveSessionIds.js');

test('interactive session IDs are opaque and validate their own format', () => {
	const first = createInteractiveSessionId();
	const second = createInteractiveSessionId();
	assert.match(first, /^ibs_[A-Za-z0-9_-]{32}$/);
	assert.notEqual(first, second);
	assert.equal(assertInteractiveSessionId(first), first);
	assert.throws(
		() => assertInteractiveSessionId('../secret'),
		error => error.code === 'INTERACTIVE_SESSION_ID_INVALID'
	);
});

test('jar normalization is bounded and defaults without exposing path syntax', () => {
	assert.equal(normalizeInteractiveJarId(), 'default');
	assert.equal(normalizeInteractiveJarId('main_1'), 'main_1');
	assert.throws(
		() => normalizeInteractiveJarId('../jar'),
		error => error.code === 'INTERACTIVE_JAR_ID_INVALID'
	);
});

test('owner keys are stable per user and jar but distinct across either boundary', () => {
	const first = interactiveOwnerKey('user-a', 'main');
	assert.equal(first, interactiveOwnerKey('user-a', 'main'));
	assert.equal(first.length, 64);
	assert.notEqual(first, interactiveOwnerKey('user-b', 'main'));
	assert.notEqual(first, interactiveOwnerKey('user-a', 'other'));
	assert.doesNotMatch(first, /user-a|main/);
});
