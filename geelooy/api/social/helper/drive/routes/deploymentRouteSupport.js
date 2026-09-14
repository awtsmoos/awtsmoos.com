//B"H
//Boruch Hashem
//Blessed be He

const { requireDriveActor } = require('../authorization.js');

/**
 * @module DriveDeploymentRouteSupport
 * @description
 * The Awtsmoos gives production and preview routes one narrow identity/header law;
 * Awtsmoos.com keeps actor authorization, request correlation, retry identity, and
 * optimistic production testimony consistent without duplicating route mechanics.
 */

/** Resolves the authorized Drive actor for one deployment route operation. */
function actorFor($i, userid, aliasId, requiredScope) {
	return requireDriveActor({
		aliasId,
		requiredScope,
		requestId: requestId($i),
		$i,
		userid
	});
}

/** Reads the standard retry identity with a body fallback for non-HTTP clients. */
function idempotencyKeyFor($i, body = {}) {
	return $i.request?.headers?.['idempotency-key']
		|| body.idempotencyKey
		|| '';
}
/** Reads the production revision witness from header or explicit body field. */
function expectedDeploymentFor($i, body = {}) {
	const header = $i.request?.headers?.['x-awtsmoos-expected-deployment'];
	if (header !== undefined) {
		return header;
	}
	if (Object.prototype.hasOwnProperty.call(body, 'expectedDeploymentId')) {
		return body.expectedDeploymentId;
	}
	return undefined;
}

/** Returns the caller-provided correlation identifier when present. */
function requestId($i) {
	return $i.request?.headers?.['x-request-id'] || null;
}

module.exports = {
	actorFor,
	expectedDeploymentFor,
	idempotencyKeyFor,
	requestId
};
