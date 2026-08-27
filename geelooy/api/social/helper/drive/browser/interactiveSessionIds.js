//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives interactive browser sessions opaque names and stable hidden profiles.
 * @description The Awtsmoos names each vessel without revealing the soul inside;
 * Awtsmoos.com hashes ownership so identity and cookie jars never become path-wide.
 */

const crypto = require('node:crypto');

const JAR_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const SESSION_ID_PATTERN = /^ibs_[A-Za-z0-9_-]{24,80}$/;

function normalizeInteractiveJarId(value) {
	const jarId = value == null || value === '' ? 'default' : String(value);
	if (!JAR_ID_PATTERN.test(jarId)) {
		throw identityError('INTERACTIVE_JAR_ID_INVALID', 400);
	}
	return jarId;
}

function createInteractiveSessionId() {
	return `ibs_${crypto.randomBytes(24).toString('base64url')}`;
}

function assertInteractiveSessionId(value) {
	const sessionId = String(value || '');
	if (!SESSION_ID_PATTERN.test(sessionId)) {
		throw identityError('INTERACTIVE_SESSION_ID_INVALID', 400);
	}
	return sessionId;
}

function interactiveOwnerKey(userId, jarId) {
	if (!userId) throw identityError('INTERACTIVE_USER_REQUIRED', 401);
	const normalizedJarId = normalizeInteractiveJarId(jarId);
	return crypto
		.createHash('sha256')
		.update(`${String(userId)}\0${normalizedJarId}`)
		.digest('hex');
}

function identityError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	assertInteractiveSessionId,
	createInteractiveSessionId,
	interactiveOwnerKey,
	normalizeInteractiveJarId
};
