//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveCredentialPolicy
 * @description
 * The Awtsmoos gives every agent only the measured light required for its work.
 * Awtsmoos.com never grants credential-management or quota scopes to a token.
 */

const crypto = require('crypto');

const ALLOWED_SCOPES = Object.freeze([
	'drive.read',
	'drive.write',
	'drive.delete',
	'drive.public',
	'drive.migrate'
]);

const MAX_ACTIVE_CREDENTIALS = 20;
const MAX_IDEMPOTENCY_RECORDS = 200;

function normalizeScopes(value) {
	const requested = Array.isArray(value) ? value : [];
	const scopes = [...new Set(requested.map(scope => String(scope).trim()))].sort();
	if (!scopes.length) throw credentialPolicyError('SCOPES_REQUIRED');
	for (const scope of scopes) {
		if (!ALLOWED_SCOPES.includes(scope)) {
			throw credentialPolicyError('SCOPE_NOT_ALLOWED');
		}
	}
	return scopes;
}

function normalizeCredentialName(value) {
	const name = String(value || '').trim();
	if (name.length < 2 || name.length > 80) {
		throw credentialPolicyError('CREDENTIAL_NAME_INVALID');
	}
	return name;
}

function normalizeIdempotencyKey(value) {
	const key = String(value || '').trim();
	if (key.length < 8 || key.length > 200) {
		throw credentialPolicyError('IDEMPOTENCY_KEY_REQUIRED');
	}
	return crypto.createHash('sha256').update(key).digest('hex');
}

function requestFingerprint(ownerUserId, name, scopes) {
	return crypto.createHash('sha256')
		.update(JSON.stringify({ ownerUserId, name, scopes }))
		.digest('hex');
}

function hasScope(credential, requiredScope) {
	if (!requiredScope) return true;
	if (credential.scopes?.includes(requiredScope)) return true;
	return credential.scopes?.includes('drive.migrate')
		&& ['drive.read', 'drive.write', 'drive.delete', 'drive.public'].includes(requiredScope);
}

function credentialPolicyError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	ALLOWED_SCOPES,
	MAX_ACTIVE_CREDENTIALS,
	MAX_IDEMPOTENCY_RECORDS,
	normalizeScopes,
	normalizeCredentialName,
	normalizeIdempotencyKey,
	requestFingerprint,
	hasScope,
	credentialPolicyError
};
