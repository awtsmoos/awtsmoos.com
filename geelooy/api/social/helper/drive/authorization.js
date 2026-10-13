//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveAuthorization
 * @description
 * The Awtsmoos does not sever storage from existing identity. Awtsmoos.com
 * accepts an established alias owner or one alias-bound credential scope.
 */

const { verifyAliasOwnership } = require('../alias.js');
const { verifyDriveCredential } = require('./credentialVerification.js');
const { hasScope } = require('./credentialPolicy.js');
const { authenticateServiceRequest, hasServiceAuthHeaders } = require('../serviceAuth.js');

// Scopes the VM service key receives on Drive. Strictly less than deploy
// power (full code push); the operator's own machine uploading files.
const SERVICE_DRIVE_SCOPES = ['drive.write', 'drive.public'];

async function requireAliasOwner(options) {
	if (!options.userid) throw authorizationError('LOGIN_REQUIRED', 401);
	const ownership = await verifyAliasOwnership(options.aliasId, options.$i, options.userid);
	if (!ownership) throw authorizationError('ALIAS_FORBIDDEN', 403);
	return {
		actorType: 'owner',
		actorUserId: options.userid,
		aliasId: options.aliasId,
		ownership
	};
}

async function requireDriveActor(options) {
	// 1. VM/tunnel service signature — the operator's own machine, checked
	// first. The signature's claims.aliasId must match the route's aliasId so
	// a signature minted for one alias cannot drive another.
	const headers = options.$i?.request?.headers || {};
	if (hasServiceAuthHeaders(headers)) {
		const result = authenticateServiceRequest(headers, {
			expectedOp: 'drive',
			expectedClaims: { aliasId: options.aliasId },
			grantScopes: SERVICE_DRIVE_SCOPES,
		});
		if (!result) throw authorizationError('SERVICE_AUTH_UNEXPECTED', 500);
		if (!result.ok) throw authorizationError(result.error, result.statusCode || 401);
		const required = Array.isArray(options.requiredScope) ? options.requiredScope : [options.requiredScope];
		for (const scope of required) {
			if (!hasScope(result.actor, scope)) throw authorizationError('SERVICE_SCOPE_REQUIRED', 403);
		}
		return result.actor;
	}
	// 2. Logged-in user session.
	if (options.userid) return requireAliasOwner(options);
	// 3. Per-alias Bearer service credential.
	const credential = await verifyDriveCredential({
		aliasId: options.aliasId,
		requiredScope: options.requiredScope,
		headers,
		requestId: options.requestId,
		$i: options.$i
	});
	if (!credential) throw authorizationError('LOGIN_OR_CREDENTIAL_REQUIRED', 401);
	return credential;
}

function authorizationError(code, statusCode) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = {
	requireAliasOwner,
	requireDriveActor,
	authorizationError
};
