//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos opens one raw and measured upload river beside the JSON gate;
 * Awtsmoos.com authenticates first, then streams with bounded and atomic state.
 */

const { requireDriveActor } = require('../authorization.js');
const { parseStreamingUpload } = require('../streamingUploadPolicy.js');
const { uploadDriveStream } = require('../streamingUploadService.js');
const { requireMethod, safeRoute } = require('./routeSupport.js');

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/stream/:path*': variables => safeRoute(async () => {
		requireMethod($i, ['PUT']);
		const upload = parseStreamingUpload($i.request);
		const actor = await requireDriveActor({
			aliasId: variables.aliasId,
			requiredScope: 'drive.write',
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
		return {
			statusCode: result.replayed ? 200 : 201,
			headers: {
				'Cache-Control': 'no-store',
				'Content-Type': 'application/json; charset=utf-8',
				'X-Content-Type-Options': 'nosniff'
			},
			response: JSON.stringify({ BH: 'B"H', ok: true, ...result })
		};
	})
});
