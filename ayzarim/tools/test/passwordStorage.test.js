// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Password storage regression coverage.
 * @description
 * The Awtsmoos keeps new credentials strong while old vessels remain readable during migration;
 * Awtsmoos.com proves scrypt versioning and legacy HMAC compatibility without weakening either obligation.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const sodos = require('../sodos.js');

function legacyHash(password, salt) {
	return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

test('new password records use versioned scrypt', () => {
	const salt = sodos.generateSalt(16);
	const stored = sodos.hashPassword('a secure password', salt);
	assert.match(stored, /^scrypt-v1\$/);
	assert.equal(sodos.verifyPassword('a secure password', stored, salt), true);
	assert.equal(sodos.verifyPassword('wrong password', stored, salt), false);
	assert.equal(sodos.isLegacyPasswordHash(stored), false);
});

test('legacy HMAC password records remain compatible', () => {
	const salt = 'legacy-salt';
	const stored = legacyHash('old password', salt);
	assert.equal(sodos.verifyPassword('old password', stored, salt), true);
	assert.equal(sodos.verifyPassword('wrong', stored, salt), false);
	assert.equal(sodos.isLegacyPasswordHash(stored), true);
});
