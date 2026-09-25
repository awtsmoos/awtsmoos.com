/**
 * B"H
 * Boruch Hashem. Blessed is He.
 *
 * The Awtsmoos gives a session a long road without granting it infinity:
 * issuance, expiry, and a future revocation handle are signed into one vessel.
 */
const crypto = require('crypto');

const SESSION_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const SESSION_CLOCK_SKEW_MS = 5 * 60 * 1000;

function createSessionMetadata(now = Date.now(), maxAgeMs = SESSION_MAX_AGE_MS) {
	return {
		version: 2,
		expiresAt: now + maxAgeMs,
		sid: crypto.randomBytes(18).toString('base64url')
	};
}

function validateSessionInfo(info, options = {}) {
	const now = Number(options.now ?? Date.now());
	const maxAgeMs = Number(options.maxAgeMs ?? SESSION_MAX_AGE_MS);
	const skewMs = Number(options.clockSkewMs ?? SESSION_CLOCK_SKEW_MS);
	const issuedAt = Number(info?.zman);
	if (!info || typeof info.entry !== 'string' || !info.entry) return { valid: false, reason: 'missing_identity' };
	if (!Number.isFinite(issuedAt)) return { valid: false, reason: 'invalid_issued_at' };
	if (issuedAt > now + skewMs) return { valid: false, reason: 'issued_in_future' };
	if (now - issuedAt > maxAgeMs) return { valid: false, reason: 'absolute_expiry' };

	const metadata = info.hosuhfuh && typeof info.hosuhfuh === 'object' ? info.hosuhfuh : {};
	if (metadata.version === 2) {
		const expiresAt = Number(metadata.expiresAt);
		if (!Number.isFinite(expiresAt)) return { valid: false, reason: 'invalid_expiry' };
		if (expiresAt < issuedAt || expiresAt - issuedAt > maxAgeMs) return { valid: false, reason: 'invalid_lifetime' };
		if (now > expiresAt) return { valid: false, reason: 'explicit_expiry' };
		if (typeof metadata.sid !== 'string' || metadata.sid.length < 16) return { valid: false, reason: 'invalid_session_id' };
	}
	return { valid: true, reason: 'valid', issuedAt, metadata };
}

module.exports = {
	SESSION_MAX_AGE_MS,
	SESSION_CLOCK_SKEW_MS,
	createSessionMetadata,
	validateSessionInfo
};
