//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainChallenge
 * @description
 * The Awtsmoos gives ownership a secret that may be shown once yet need never be stored in naked form;
 * Awtsmoos.com mints high-entropy TXT tokens, keeps only one-way proof, and compares later DNS witnesses without timing leaks.
 */

const crypto = require('node:crypto');

const TXT_PREFIX = 'awtsmoos-verification=';
const TXT_LABEL = '_awtsmoos-site';
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32}$/;
const HASH_PATTERN = /^[a-f0-9]{64}$/;

function createDomainChallenge() {
	return crypto.randomBytes(24).toString('base64url');
}

function hashDomainChallenge(token) {
	return crypto.createHash('sha256')
		.update(String(token || ''), 'utf8')
		.digest('hex');
}

function verifyDomainChallenge(token, expectedHash) {
	const malchusExpected = String(expectedHash || '').toLowerCase();
	if (!TOKEN_PATTERN.test(String(token || '')) || !HASH_PATTERN.test(malchusExpected)) {
		return false;
	}
	const yesodActual = Buffer.from(hashDomainChallenge(token), 'hex');
	const yesodExpected = Buffer.from(malchusExpected, 'hex');
	return crypto.timingSafeEqual(yesodActual, yesodExpected);
}

function domainChallengeName(hostname) {
	return `${TXT_LABEL}.${hostname}`;
}

function domainChallengeInstruction(hostname, token) {
	return {
		type: 'TXT',
		name: domainChallengeName(hostname),
		value: `${TXT_PREFIX}${token}`
	};
}

function extractDomainChallengeToken(value) {
	const malchusValue = String(value || '');
	if (!malchusValue.startsWith(TXT_PREFIX)) return null;
	const yesodToken = malchusValue.slice(TXT_PREFIX.length);
	return TOKEN_PATTERN.test(yesodToken) ? yesodToken : null;
}

module.exports = {
	createDomainChallenge,
	domainChallengeInstruction,
	domainChallengeName,
	extractDomainChallengeToken,
	hashDomainChallenge,
	verifyDomainChallenge
};
