//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteRoutes
 * @description
 * The Awtsmoos lets an alias owner inspect and bind canonical site roots through the same Drive covenant;
 * Awtsmoos.com keeps read and write authority distinct while every returned public path points to an owned mapping identity.
 */

const { requireDriveActor } = require('../authorization.js');
const {
	deleteSiteMapping,
	listSiteMappings,
	upsertSiteMapping
} = require('../siteMappingService.js');
const { getDriveSiteStatus } = require('../siteStatusService.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');
const {
	namedSitePath,
	primarySitePath
} = require('../../../../../sites/siteResolution.js');

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/site': (variables) => safeRoute(async () => {
		requireMethod($i, ['GET']);
		await authorize(variables.aliasId, 'drive.read', $i, userid);
		return {
			site: await getDriveSiteStatus(variables.aliasId, $i)
		};
	}),
	'/drive/:aliasId/sites': (variables) => safeRoute(async () => {
		requireMethod($i, ['GET']);
		await authorize(variables.aliasId, 'drive.read', $i, userid);
		const sites = await listSiteMappings(variables.aliasId, $i);
		return {
			sites: sites.map((site) => presentSite(variables.aliasId, site))
		};
	}),
	'/drive/:aliasId/sites/:siteId': (variables) => safeRoute(async () => {
		const method = requireMethod($i, ['POST', 'PUT', 'DELETE']);
		await authorize(variables.aliasId, 'drive.write', $i, userid);
		if (method === 'DELETE') {
			const deleted = await deleteSiteMapping({
				aliasId: variables.aliasId,
				siteId: variables.siteId,
				$i
			});
			return {
				site: {
					...deleted,
					canonicalPath: namedSitePath(variables.aliasId, deleted.siteId)
				}
			};
		}
		const site = await upsertSiteMapping({
			aliasId: variables.aliasId,
			siteId: variables.siteId,
			input: bodyFor($i),
			$i
		});
		return {
			site: presentSite(variables.aliasId, site)
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

function presentSite(aliasId, site) {
	return {
		...site,
		canonicalPath: namedSitePath(aliasId, site.id),
		primaryPath: site.primary ? primarySitePath(aliasId) : null
	};
}
