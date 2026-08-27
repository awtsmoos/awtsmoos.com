//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves a one-time ownership whisper can be verified without preserving its naked sound;
 * Awtsmoos.com keeps high entropy, exact TXT grammar, and timing-safe one-way proof beneath the claim.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	createDomainChallenge,
	domainChallengeInstruction,
	extractDomainChallengeToken,
	hashDomainChallenge,
	verifyDomainChallenge
} = require('../domainChallenge.js');

test('mints 24 random bytes as a 32-character base64url token', () => {
	const first = createDomainChallenge();
	const second = createDomainChallenge();
	assert.match(first, /^[A-Za-z0-9_-]{32}$/);
	assert.notEqual(first, second);
});

test('stores one-way proof and verifies only the exact token', () => {
	const token = createDomainChallenge();
	const hash = hashDomainChallenge(token);
	assert.match(hash, /^[a-f0-9]{64}$/);
	assert.notEqual(hash, token);
	assert.equal(verifyDomainChallenge(token, hash), true);
	assert.equal(verifyDomainChallenge(createDomainChallenge(), hash), false);
	assert.equal(verifyDomainChallenge('short', hash), false);
});

test('TXT instruction and extraction require exact Awtsmoos grammar', () => {
	const token = createDomainChallenge();
	const instruction = domainChallengeInstruction('example.org', token);
	assert.deepEqual(instruction, {
		type: 'TXT',
		name: '_awtsmoos-site.example.org',
		value: `awtsmoos-verification=${token}`
	});
	assert.equal(extractDomainChallengeToken(instruction.value), token);
	assert.equal(extractDomainChallengeToken(`other=${token}`), null);
	assert.equal(extractDomainChallengeToken('awtsmoos-verification=short'), null);
});
