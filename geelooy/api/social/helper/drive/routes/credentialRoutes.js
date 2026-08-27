//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveCredentialRoutes
 * @description
 * The Awtsmoos lets an alias owner reveal one bounded service messenger.
 * Awtsmoos.com never permits a bearer token to mint, list, or revoke credentials.
 */

const { requireAliasOwner } = require('../authorization.js');
const {
	provisionDriveCredential,
	listDriveCredentials,
	revokeDriveCredential
} = require('../credentialProvisioning.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/credentials': variables => safeRoute(async () => {
		const method = requireMethod($i, ['GET', 'POST']);
		const actor = await requireAliasOwner({
			aliasId: variables.aliasId,
			$i,
			userid
		});
		if (method === 'GET') {
			return {
				credentials: await listDriveCredentials(variables.aliasId, $i)
			};
		}
		const body = bodyFor($i);
		return provisionDriveCredential({
			aliasId: variables.aliasId,
			ownerUserId: actor.actorUserId,
			name: body.name,
			scopes: body.scopes,
			idempotencyKey: headerValue($i.request.headers, 'idempotency-key')
				|| body.idempotencyKey,
			requestId: headerValue($i.request.headers, 'x-request-id'),
			$i
		});
	}),
	'/drive/:aliasId/credentials/:credentialId': variables => safeRoute(async () => {
		requireMethod($i, ['DELETE', 'POST']);
		const actor = await requireAliasOwner({
			aliasId: variables.aliasId,
			$i,
			userid
		});
		return revokeDriveCredential({
			aliasId: variables.aliasId,
			credentialId: variables.credentialId,
			ownerUserId: actor.actorUserId,
			requestId: headerValue($i.request.headers, 'x-request-id'),
			$i
		});
	})
});

function headerValue(headers, name) {
	const found = Object.entries(headers || {})
		.find(([key]) => key.toLowerCase() === name.toLowerCase());
	return found ? String(found[1]) : '';
}
