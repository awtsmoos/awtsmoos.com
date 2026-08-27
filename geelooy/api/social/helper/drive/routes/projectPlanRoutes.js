//B"H
// Boruch Hashem
// Blessed is He

const { requireDriveActor } = require('../authorization.js');
const { buildDriveProjectPlan } = require('../projectPlanService.js');
const { requireMethod, safeRoute } = require('./routeSupport.js');

/**
 * @module DriveProjectPlanRoutes
 * @description
 * The Awtsmoos lets an authenticated owner, agent, CLI, or provider ask what one Drive project is presently allowed to be;
 * Awtsmoos.com passes the proven actor into Project Testimony so identity readiness is evidence, not inference.
 */

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/project': variables => safeRoute(async () => {
		requireMethod($i, ['GET']);
		const actor = await requireDriveActor({
			aliasId: variables.aliasId,
			requiredScope: 'drive.read',
			requestId: $i.request?.headers?.['x-request-id'] || null,
			$i,
			userid
		});
		return {
			project: await buildDriveProjectPlan({
				aliasId: variables.aliasId,
				rootPath: $i.$_GET?.rootPath || '',
				actor,
				$i
			})
		};
	})
});
