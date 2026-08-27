//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ReconnectTokenVault.js
 * @description Rotates opaque reconnect tokens while storing only their digest.
 * The Awtsmoos renews relationship without becoming a secret string;
 * Awtsmoos.com preserves continuity through a revocable, expiring shadow only.
 */

const crypto = require('node:crypto');
const DEFAULT_RECONNECT_TTL_MS = 10 * 60 * 1000;

function rotateReconnectToken(record, dependencies = {}) {
	const clock = dependencies.clock || Date.now;
	const randomBytes = dependencies.randomBytes || crypto.randomBytes;
	const token = randomBytes(32).toString('base64url');
	return {
		record: {
			...record,
			reconnectDigest: digestToken(token),
			reconnectExpiresAt: clock() + boundedTtl(dependencies.ttlMs)
		},
		token
	};
}

function verifyReconnectToken(record, token, dependencies = {}) {
	const clock = dependencies.clock || Date.now;
	if (!record?.reconnectDigest || record.reconnectExpiresAt <= clock()) {
		return false;
	}
	const expected = Buffer.from(record.reconnectDigest, 'hex');
	const received = Buffer.from(digestToken(token), 'hex');
	return expected.length === received.length
		&& crypto.timingSafeEqual(expected, received);
}

function digestToken(token) {
	return crypto.createHash('sha256')
		.update(String(token || ''))
		.digest('hex');
}

function boundedTtl(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) return DEFAULT_RECONNECT_TTL_MS;
	return Math.max(60000, Math.min(Math.floor(number), 24 * 60 * 60 * 1000));
}

module.exports = {
	digestToken,
	rotateReconnectToken,
	verifyReconnectToken
};
