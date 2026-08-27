//B"H
// Boruch Hashem
// Blessed is He

const crypto = require('crypto');
const { promisify } = require('util');

/**
 * @module RepositoryCredentialCrypto
 * @description
 * The Awtsmoos reveals a Git app password once and preserves only a salted
 * proof. Awtsmoos.com gives Git its own token namespace while reusing the same
 * scrypt and timing-safe covenant already proven by Drive credentials.
 */

const scrypt = promisify(crypto.scrypt);
const TOKEN_PREFIX = 'awts_git_';

async function createRepositorySecret() {
	const credentialId = crypto.randomBytes(12).toString('hex');
	const secret = crypto.randomBytes(32).toString('base64url');
	const salt = crypto.randomBytes(16).toString('base64url');
	const secretHash = await deriveSecretHash(secret, salt);
	return {
		credentialId,
		secretHash,
		salt,
		token: `${TOKEN_PREFIX}${credentialId}.${secret}`
	};
}

function parseRepositoryToken(value) {
	const raw = String(value || '').trim();
	if (!raw.startsWith(TOKEN_PREFIX)) return null;
	const separator = raw.indexOf('.', TOKEN_PREFIX.length);
	if (separator < 0) return null;
	const credentialId = raw.slice(TOKEN_PREFIX.length, separator);
	const secret = raw.slice(separator + 1);
	if (!/^[a-f0-9]{24}$/.test(credentialId) || secret.length < 32) return null;
	return { credentialId, secret };
}

async function verifyRepositorySecret(secret, salt, expectedHash) {
	if (!secret || !salt || !expectedHash) return false;
	const actual = Buffer.from(await deriveSecretHash(secret, salt), 'base64url');
	const expected = Buffer.from(String(expectedHash), 'base64url');
	return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

async function deriveSecretHash(secret, salt) {
	const derived = await scrypt(String(secret), String(salt), 32);
	return Buffer.from(derived).toString('base64url');
}

module.exports = {
	TOKEN_PREFIX,
	createRepositorySecret,
	parseRepositoryToken,
	verifyRepositorySecret
};
