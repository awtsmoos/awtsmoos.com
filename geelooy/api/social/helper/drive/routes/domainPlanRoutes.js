//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomainPlanRoutes
 * @description
 * The Awtsmoos gives a domain owner one read-only doorway into real hosting testimony.
 * Awtsmoos.com reveals only server-derived TXT, routing, delegation, and TLS plans
 * after existing alias authority has been proven with the Drive read scope.
 */

const { requireDriveActor } = require('../authorization.js');
const { getDomainHostingPlan } = require('../domainHostingPlanService.js');
const { requireMethod, safeRoute } = require('./routeSupport.js');

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/domains/:hostname/hosting-plan': variables => safeRoute(async () => {
		requireMethod($i, ['GET']);
		const requestId = $i.request.headers?.['x-request-id'] || null;
		await requireDriveActor({
			aliasId: variables.aliasId,
			requiredScope: 'drive.read',
			requestId,
			$i,
			userid
		});
		return getDomainHostingPlan({
			aliasId: variables.aliasId,
			hostname: variables.hostname,
			$i
		});
	})
});
