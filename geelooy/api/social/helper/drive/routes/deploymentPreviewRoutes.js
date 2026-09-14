//B"H
//Boruch Hashem
//Blessed be He

const { deploymentError } = require('../deploymentPolicy.js');
const deployments = require('../deploymentService.js');
const { buildPreviewDeploymentResponse } = require('../deploymentPreviewResponse.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');
const { actorFor, idempotencyKeyFor, requestId } = require('./deploymentRouteSupport.js');

/**
 * @module DriveDeploymentPreviewRoutes
 * @description
 * The Awtsmoos gives authenticated creators one production-like immutable preview
 * tree; Awtsmoos.com keeps preview creation, metadata, and byte serving separate
 * from the production deployment routes and from the public Site gateway.
 */

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/sites/:siteId/previews': variables => safeRoute(async () => {
		const method = requireMethod($i, ['GET', 'POST']);
		const scope = method === 'GET' ? 'drive.read' : 'drive.write';
		const actor = await actorFor($i, userid, variables.aliasId, scope);
		if (method === 'GET') {
			return {
				previews: await deployments.listDeployments(
					variables.aliasId,
					variables.siteId,
					$i,
					'preview'
				)
			};
		}
		return createPreview($i, variables, actor);
	}),
	'/drive/:aliasId/sites/:siteId/previews/:deploymentId': variables => safeRoute(async () => {
		requireMethod($i, ['GET']);
		await actorFor($i, userid, variables.aliasId, 'drive.read');
		const deployment = await deployments.getDeployment(
			variables.aliasId,
			variables.siteId,
			variables.deploymentId,
			$i
		);
		if (!deployment || deployment.environment !== 'preview') {
			throw deploymentError('PREVIEW_NOT_FOUND', 404);
		}
		return { preview: deployment };
	}),
	'/drive/:aliasId/sites/:siteId/previews/:deploymentId/content': variables => {
		return previewContent($i, userid, variables, '');
	},
	'/drive/:aliasId/sites/:siteId/previews/:deploymentId/content/:path*': variables => {
		return previewContent($i, userid, variables, variables.path || '');
	}
});

/** Creates one immutable preview and returns its authenticated content URL. */
async function createPreview($i, variables, actor) {
	const body = bodyFor($i);
	const result = await deployments.createPreviewDeployment({
		aliasId: variables.aliasId,
		siteId: variables.siteId,
		projectId: body.projectId,
		rootPath: body.rootPath,
		message: body.message,
		idempotencyKey: idempotencyKeyFor($i, body),
		actorUserId: actor.actorUserId,
		credentialId: actor.credentialId,
		requestId: requestId($i),
		$i
	});
	return { ...result, previewUrl: previewUrl(variables, result.deployment.id) };
}
/** Serves authenticated preview bytes after checking read authority. */
async function previewContent($i, userid, variables, path) {
	return safeRoute(async () => {
		const method = requireMethod($i, ['GET', 'HEAD']);
		await actorFor($i, userid, variables.aliasId, 'drive.read');
		return buildPreviewDeploymentResponse({
			aliasId: variables.aliasId,
			siteId: variables.siteId,
			deploymentId: variables.deploymentId,
			path,
			method,
			headers: $i.request?.headers || {},
			url: $i.request?.url || '',
			$i
		});
	});
}

/** Resolves the canonical authenticated preview root URL. */
function previewUrl(variables, deploymentId) {
	const alias = encodeURIComponent(variables.aliasId);
	const site = encodeURIComponent(variables.siteId);
	const deployment = encodeURIComponent(deploymentId);
	return `/api/social/drive/${alias}/sites/${site}/previews/${deployment}/content/`;
}
