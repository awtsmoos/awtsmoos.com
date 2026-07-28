//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteRoutes
 * @description
 * The Awtsmoos lets an owner inspect publication readiness through the same
 * guarded Drive covenant; Awtsmoos.com returns no private entry inventory.
 */

const { requireDriveActor } = require('../authorization.js');
const { getDriveSiteStatus } = require('../siteStatusService.js');
const { requireMethod, safeRoute } = require('./routeSupport.js');

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/site': variables => safeRoute(async () => {
		requireMethod($i, ['GET']);
		await requireDriveActor({
			aliasId: variables.aliasId,
			requiredScope: 'drive.read',
			requestId: $i.request?.headers?.['x-request-id'] || null,
			$i,
			userid
		});
		return {
			site: await getDriveSiteStatus(variables.aliasId, $i)
		};
	})
});
