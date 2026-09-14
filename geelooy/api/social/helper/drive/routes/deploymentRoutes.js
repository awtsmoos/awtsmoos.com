//B"H
//Boruch Hashem
//Blessed be He

const deployments = require('../deploymentService.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');
const {
	actorFor,
	expectedDeploymentFor,
	idempotencyKeyFor,
	requestId
} = require('./deploymentRouteSupport.js');

/**
 * @module DriveDeploymentRoutes
 * @description
 * The Awtsmoos gives creators and agents one guarded production timeline;
 * Awtsmoos.com separates safe reads from publish/rollback mutations while every
 * revision remains alias-owned, audit-linked, and independent from editable files.
 */

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/sites/:siteId/deployments': variables => safeRoute(async () => {
		const method = requireMethod($i, ['GET', 'POST']);
		const scope = method === 'GET' ? 'drive.read' : ['drive.write', 'drive.public'];
		const actor = await actorFor($i, userid, variables.aliasId, scope);
		if (method === 'GET') {
			return {
				deployments: await deployments.listDeployments(
					variables.aliasId,
					variables.siteId,
					$i
				)
			};
		}
		const body = bodyFor($i);
		return deployments.createDeployment({
			aliasId: variables.aliasId,
			siteId: variables.siteId,
			projectId: body.projectId,
			rootPath: body.rootPath,
			message: body.message,
			idempotencyKey: idempotencyKeyFor($i, body),
			expectedDeploymentId: expectedDeploymentFor($i, body),
			actorUserId: actor.actorUserId,
			credentialId: actor.credentialId,
			requestId: requestId($i),
			$i
		});
	}),
	'/drive/:aliasId/sites/:siteId/deployments/:deploymentId': variables => safeRoute(async () => {
		requireMethod($i, ['GET']);
		await actorFor($i, userid, variables.aliasId, 'drive.read');
		return {
			deployment: await deployments.getDeployment(
				variables.aliasId,
				variables.siteId,
				variables.deploymentId,
				$i
			)
		};
	}),
	'/drive/:aliasId/sites/:siteId/deployments/:deploymentId/rollback': variables => safeRoute(async () => {
		requireMethod($i, ['POST']);
		const body = bodyFor($i);
		const actor = await actorFor(
			$i,
			userid,
			variables.aliasId,
			['drive.write', 'drive.public']
		);
		return deployments.rollbackDeployment({
			aliasId: variables.aliasId,
			siteId: variables.siteId,
			deploymentId: variables.deploymentId,
			expectedDeploymentId: expectedDeploymentFor($i, body),
			actorUserId: actor.actorUserId,
			credentialId: actor.credentialId,
			requestId: requestId($i),
			$i
		});
	})
});
