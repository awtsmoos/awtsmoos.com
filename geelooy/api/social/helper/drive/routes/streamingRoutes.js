//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveStreamingRoutes
 * @description The Awtsmoos opens a raw byte river only after exact scope judgment; Awtsmoos.com lets private writes remain private while public immutable revelation requires public authority.
 */

const { requireDriveActor } = require('../authorization.js');
const { streamingScopes } = require('../scopePolicy.js');
const { parseStreamingUpload } = require('../streamingUploadPolicy.js');
const { uploadDriveStream } = require('../streamingUploadService.js');
const { requireMethod, safeRoute } = require('./routeSupport.js');

/**
 * @description Creates the authenticated raw streaming upload route.
 * @param {Object} context - Route construction context.
 * @param {Object} context.$i - Active Awtsmoos request interface.
 * @param {string|null} context.userid - Logged-in user identifier when present.
 * @returns {Object<string,Function>} Streaming Drive route map.
 */
function createStreamingRoutes(context) {
	return {
		'/drive/:aliasId/stream/:path*': handleStreamingUpload.bind(null, context)
	};
}

/**
 * @description Wraps one streaming upload in the shared safe HTTP error boundary.
 * @param {Object} context - Route context containing request interface and user identity.
 * @param {Object} variables - Router variables containing aliasId and logical path.
 * @returns {Promise<Object>} Safe HTTP-shaped upload response.
 */
function handleStreamingUpload(context, variables) {
	return safeRoute(executeStreamingUpload.bind(null, context, variables));
}

/**
 * @description Parses raw upload policy, enforces compound scopes, streams bytes, and returns an idempotent receipt.
 * @param {Object} context - Route context containing $i and optional userid.
 * @param {Object} variables - Router variables containing aliasId and logical path.
 * @returns {Promise<Object>} HTTP-shaped successful upload response.
 */
async function executeStreamingUpload({ $i, userid }, variables) {
	requireMethod($i, ['PUT']);
	const upload = parseStreamingUpload($i.request);
	const actor = await requireDriveActor({
		aliasId: variables.aliasId,
		requiredScope: streamingScopes(upload),
		requestId: upload.requestId,
		$i,
		userid
	});
	const result = await uploadDriveStream({
		...upload,
		aliasId: variables.aliasId,
		path: variables.path,
		actorUserId: actor.actorUserId,
		credentialId: actor.credentialId,
		request: $i.request,
		$i
	});
	return successResponse(result);
}

/**
 * @description Shapes a no-store JSON receipt for a newly committed or idempotently replayed upload.
 * @param {Object} result - Streaming upload service result.
 * @returns {Object} HTTP-shaped JSON response.
 */
function successResponse(result) {
	return {
		statusCode: result.replayed ? 200 : 201,
		headers: {
			'Cache-Control': 'no-store',
			'Content-Type': 'application/json; charset=utf-8',
			'X-Content-Type-Options': 'nosniff'
		},
		response: JSON.stringify({ BH: 'B"H', ok: true, ...result })
	};
}

module.exports = createStreamingRoutes;
