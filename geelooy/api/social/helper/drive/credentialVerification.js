//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveCredentialVerification
 * @description
 * The Awtsmoos tests a concealed service spark against its salted proof.
 * Awtsmoos.com binds every token to one alias and every required compound scope.
 */

const { parseCredentialToken, verifyCredentialSecret } = require('./credentialCrypto.js');
const { hasScope, credentialPolicyError } = require('./credentialPolicy.js');
const { readDriveState, mutateDriveState } = require('./stateRepository.js');
const { recordDriveEvent } = require('./auditEvents.js');

async function verifyDriveCredential(options) {
	const bearer = bearerToken(options.headers);
	const parsed = parseCredentialToken(bearer);
	if (!parsed) return null;
	const state = await readDriveState(options.aliasId, options.$i);
	const credential = state.serviceCredentials[parsed.credentialId];
	if (!credential || credential.revokedAt) throw unauthorized('CREDENTIAL_INVALID');
	const valid = await verifyCredentialSecret(
		parsed.secret,
		credential.secretSalt,
		credential.secretHash
	);
	if (!valid) throw unauthorized('CREDENTIAL_INVALID');
	for (const scope of requiredScopes(options.requiredScope)) {
		if (!hasScope(credential, scope)) throw forbidden('CREDENTIAL_SCOPE_REQUIRED');
	}
	await markCredentialUse(options, credential.id);
	return {
		actorType: 'service',
		actorUserId: null,
		aliasId: options.aliasId,
		credentialId: credential.id,
		scopes: [...credential.scopes]
	};
}

async function markCredentialUse(options, credentialId) {
	await mutateDriveState(options.aliasId, options.$i, state => {
		const credential = state.serviceCredentials[credentialId];
		if (!credential || credential.revokedAt) return;
		credential.lastUsedAt = new Date().toISOString();
		recordDriveEvent(state, {
			type: 'credential.use',
			credentialId,
			requestId: options.requestId
		});
	});
}

function requiredScopes(value) {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}

function bearerToken(headers) {
	const value = headerValue(headers, 'authorization');
	const match = /^Bearer\s+(.+)$/i.exec(value);
	return match ? match[1].trim() : '';
}

function headerValue(headers, name) {
	const found = Object.entries(headers || {})
		.find(([key]) => key.toLowerCase() === name.toLowerCase());
	return found ? String(found[1]) : '';
}

function unauthorized(code) {
	const error = credentialPolicyError(code);
	error.statusCode = 401;
	return error;
}

function forbidden(code) {
	const error = credentialPolicyError(code);
	error.statusCode = 403;
	return error;
}

module.exports = {
	verifyDriveCredential,
	bearerToken,
	requiredScopes
};
