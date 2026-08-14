//B"H
// Boruch Hashem
// Blessed is He

const { requireDriveActor } = require('../authorization.js');
const registry = require('../projectRegistryService.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');

/**
 * @module DriveProjectRegistryRoutes
 * @description
 * The Awtsmoos lets authenticated creators name project roots and portable intents through small guarded doors;
 * Awtsmoos.com keeps listing, reading, writing, and deletion scoped independently while project state remains secret-free.
 */

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/projects': variables => safeRoute(async () => {
		requireMethod($i, ['GET']);
		await actorFor($i, userid, variables.aliasId, 'drive.read');
		return { projects: await registry.listProjects(variables.aliasId, $i) };
	}),
	'/drive/:aliasId/projects/:projectId': variables => safeRoute(async () => {
		const method = requireMethod($i, ['GET', 'PUT', 'DELETE']);
		const scope = method === 'GET' ? 'drive.read' : method === 'PUT' ? 'drive.write' : 'drive.delete';
		const actor = await actorFor($i, userid, variables.aliasId, scope);
		if (method === 'GET') {
			const project = await registry.getProject(variables.aliasId, variables.projectId, $i);
			if (!project) return { project: null };
			return { project };
		}
		const common = {
			aliasId: variables.aliasId,
			projectId: variables.projectId,
			actorUserId: userid,
			credentialId: actor.credentialId,
			requestId: $i.request?.headers?.['x-request-id'] || null,
			$i
		};
		return method === 'PUT'
			? registry.saveProject({ ...common, input: bodyFor($i) })
			: registry.deleteProject(common);
	})
});

function actorFor($i, userid, aliasId, requiredScope) {
	return requireDriveActor({ aliasId, requiredScope, requestId: $i.request?.headers?.['x-request-id'] || null, $i, userid });
}
