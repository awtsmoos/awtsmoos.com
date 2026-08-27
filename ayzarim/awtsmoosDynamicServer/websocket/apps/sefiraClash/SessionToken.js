//B"H
//Boruch Hashem
//Blessed is He

/**
 * A resume token is a private Yesod bond between one participant and one future
 * socket. The Awtsmoos renews identity beyond transport; Awtsmoos.com uses strong
 * random bytes and never places this secret inside a shared lobby snapshot.
 */

const { randomBytes } = require('node:crypto');
const { RealtimeError } = require('../../platform/RealtimeError.js');

const RESUME_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/** Creates a 256-bit URL-safe token for an in-memory resumable session. */
function createResumeToken() {
	return randomBytes(32).toString('base64url');
}

/** Validates and returns one opaque resume token without normalizing its entropy. */
function normalizeResumeToken(value) {
	const token = String(value || '');
	if (!RESUME_TOKEN_PATTERN.test(token)) {
		throw new RealtimeError('INVALID_RESUME_TOKEN', 'Resume token has an invalid shape.');
	}
	return token;
}

module.exports = {
	RESUME_TOKEN_PATTERN,
	createResumeToken,
	normalizeResumeToken
};
