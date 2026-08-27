//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteRoutes
 * @description
 * The Awtsmoos lets an owned folder-world receive a durable public name while Awtsmoos.com keeps readiness, listing, mutation, and deletion behind one alias-bound covenant;
 * secret runtime owner keys remain inside server state, while management responses reveal only the public project identity that a creator may understand and command in light.
 */

const { requireDriveActor } = require('../authorization.js');
const {
	deleteSiteMapping,
	listSiteMappings,
	upsertSiteMapping
} = require('../siteMappingService.js');
const { getDriveSiteStatus } = require('../siteStatusService.js');
const {
	bodyFor,
	requireMethod,
	safeRoute
} = require('./routeSupport.js');

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/site': variables => safeRoute(async () => {
		requireMethod($i, ['GET']);
		await authorize(variables.aliasId, 'drive.read', $i, userid);
		return {
			site: await getDriveSiteStatus(variables.aliasId, $i)
		};
	}),
	'/drive/:aliasId/sites': variables => safeRoute(async () => {
		requireMethod($i, ['GET']);
		await authorize(variables.aliasId, 'drive.read', $i, userid);
		const sites = await listSiteMappings(variables.aliasId, $i);
		return {
			sites: sites.map(site => publicSiteRecord(variables.aliasId, site))
		};
	}),
	'/drive/:aliasId/sites/:siteId': variables => safeRoute(async () => {
		requireMethod($i, ['PUT', 'DELETE']);
		await authorize(variables.aliasId, 'drive.write', $i, userid);
		if (methodFor($i) === 'DELETE') {
			return deleteSiteMapping({
				aliasId: variables.aliasId,
				siteId: variables.siteId,
				$i
			});
		}
		const site = await upsertSiteMapping({
			aliasId: variables.aliasId,
			siteId: variables.siteId,
			input: bodyFor($i),
			$i
		});
		return {
			site: publicSiteRecord(variables.aliasId, site)
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

function methodFor($i) {
	return String($i.request?.method || 'GET').toUpperCase();
}

function publicSiteRecord(aliasId, site) {
	return {
		...site,
		source: publicSource(site.source),
		canonicalUrl: `/sites/${encodeURIComponent(aliasId)}/${encodeURIComponent(site.id)}/`
	};
}

function publicSource(source) {
	if (!source || source.kind !== 'hosted-project') return source || null;
	return {
		kind: source.kind,
		mode: source.mode,
		projectId: source.projectId
	};
}
