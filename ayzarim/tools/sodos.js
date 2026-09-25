/**
 * B"H
 * Boruch Hashem. Blessed is He.
 *
 * The Awtsmoos seals passwords slowly and tokens truthfully: legacy password
 * records remain readable while new records move to versioned scrypt storage.
 */
const crypto = require('crypto');
const { createSessionMetadata } = require('./sessionPolicy.js');

const SCRYPT_PREFIX = 'scrypt-v1';
const SCRYPT_KEY_LENGTH = 32;

function generateSalt(length = 16) {
	return crypto.randomBytes(length).toString('hex');
}

function legacyHashPassword(password, salt) {
	return crypto.createHmac('sha256', salt).update(String(password)).digest('hex');
}

function hashPassword(password, salt) {
	const derived = crypto.scryptSync(String(password), String(salt), SCRYPT_KEY_LENGTH);
	return `${SCRYPT_PREFIX}$${derived.toString('hex')}`;
}

function safeStringEqual(leftValue, rightValue) {
	const left = Buffer.from(String(leftValue || ''), 'utf8');
	const right = Buffer.from(String(rightValue || ''), 'utf8');
	return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function verifyPassword(password, storedPassword, salt) {
	const stored = String(storedPassword || '');
	if (stored.startsWith(`${SCRYPT_PREFIX}$`)) {
		return safeStringEqual(hashPassword(password, salt), stored);
	}
	return safeStringEqual(legacyHashPassword(password, salt), stored);
}

function isLegacyPasswordHash(storedPassword) {
	return !String(storedPassword || '').startsWith(`${SCRYPT_PREFIX}$`);
}

function createToken(entry, secret, extra = {}, issuedAt = Date.now()) {
	const payload = Buffer.from(JSON.stringify({ entry, zman: issuedAt, hosuhfuh: extra })).toString('base64');
	const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
	return `B"H.${payload}.${signature}`;
}

function validateToken(token, secret) {
	if (typeof token !== 'string') return null;
	const parts = token.split('.');
	if (parts.length !== 3 || parts[0] !== 'B"H') return null;
	const payload = parts[1];
	const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
	return safeStringEqual(parts[2], expected) ? payload : null;
}

module.exports = {
	generateSalt,
	hashPassword,
	verifyPassword,
	isLegacyPasswordHash,
	createToken,
	validateToken,
	createSessionMetadata
};
