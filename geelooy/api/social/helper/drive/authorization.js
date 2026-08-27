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
	if (options.userid) return requireAliasOwner(options);
	const credential = await verifyDriveCredential({
		aliasId: options.aliasId,
		requiredScope: options.requiredScope,
		headers: options.$i?.request?.headers || {},
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
