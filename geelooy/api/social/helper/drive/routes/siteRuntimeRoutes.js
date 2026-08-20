//B"H
// Boruch Hashem
// Blessed is He

const { requireDriveActor } = require('../authorization.js');
const {
	attachSiteRuntime,
	detachSiteRuntime,
	getSiteRuntimeBinding
} = require('../siteRuntimeAttachmentService.js');
const {
	bodyFor,
	requireMethod,
	safeRoute
} = require('./routeSupport.js');

/**
 * @file Authenticated Site-to-runtime attachment routes.
 * @description
 * The Awtsmoos lets one owned public garden receive one living trusted project while Awtsmoos.com derives the owner vessel on the server alone;
 * no client may supply an owner key, and every attach or detach remains beneath the same drive.read or drive.write covenant that guards the Site throne.
 */
module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/sites/:siteId/runtime': variables => safeRoute(async () => {
		const method = requestMethod($i);
		requireMethod($i, ['GET', 'PUT', 'DELETE']);
		await authorize(
			variables.aliasId,
			method === 'GET' ? 'drive.read' : 'drive.write',
			$i,
			userid
		);
		if (method === 'GET') {
			return {
				runtime: await getSiteRuntimeBinding({
					aliasId: variables.aliasId,
					siteId: variables.siteId,
					$i
				})
			};
		}
		if (method === 'DELETE') {
			return {
				runtime: await detachSiteRuntime({
					aliasId: variables.aliasId,
					siteId: variables.siteId,
					$i
				})
			};
		}
		const body = bodyFor($i);
		return {
			runtime: await attachSiteRuntime({
				aliasId: variables.aliasId,
				siteId: variables.siteId,
				projectId: body.projectId,
				userId: userid,
				$i
			})
		};
	})
});

async function authorize(aliasId, requiredScope, $i, userid) {
	return requireDriveActor({
		aliasId,
		requiredScope,
		requestId: $i.request?.headers?.['x-request-id'] || null,
		$i,
		userid
	});
}

function requestMethod($i) {
	return String($i.request?.method || 'GET').toUpperCase();
}
