//B"H
// Boruch Hashem
// Blessed is He

const { buildProjectHostingPlan } = require('../../../../../../ayzarim/awtsmoosDynamicServer/projectHosting/projectHostingPlan.js');
const { requireDriveActor } = require('../authorization.js');
const db = require('../projectDatabaseService.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');

/**
 * @module DriveProjectHostingRoutes
 * @description
 * The Awtsmoos lets an authenticated alias inspect hosting and tend one project database garden;
 * Awtsmoos.com never exposes a shell or root deletion here, only scoped plans and bounded key operations behind the owner guardian.
 */

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/projects/:projectId/hosting': variables => safeRoute(async () => {
		requireMethod($i, ['GET']);
		await authorize($i, userid, variables.aliasId, 'drive.read');
		const query = $i.$_GET || {};
		return {
			hosting: buildProjectHostingPlan({
				projectId: variables.projectId,
				ownerScope: variables.aliasId,
				rootPath: query.rootPath || `projects/${variables.projectId}`,
				exposure: query.exposure || 'private'
			})
		};
	}),
	'/drive/:aliasId/projects/:projectId/database': variables => databaseRoute({
		$i,
		userid,
		variables
	})
});

async function databaseRoute({ $i, userid, variables }) {
	return safeRoute(async () => {
		const method = requireMethod($i, ['GET', 'POST', 'DELETE']);
		const input = method === 'GET' ? ($i.$_GET || {}) : bodyFor($i);
		const scope = method === 'GET' ? 'drive.read' : method === 'POST' ? 'drive.write' : 'drive.delete';
		await authorize($i, userid, variables.aliasId, scope);
		const base = {
			$i,
			aliasId: variables.aliasId,
			projectId: variables.projectId,
			path: input.path || ''
		};
		if (method === 'GET' && input.key !== undefined) {
			return { database: await db.readProjectKey({ ...base, key: input.key }) };
		}
		if (method === 'GET' && input.view === 'capabilities') {
			return { database: db.projectDatabaseCapabilities(base) };
		}
		if (method === 'GET' && input.view === 'query') {
			return { database: await db.queryProjectDocuments({
				...base,
				limit: input.limit,
				offset: input.offset,
				field: input.field,
				operator: input.operator,
				value: input.value,
				sort: input.sort
			}) };
		}
		if (method === 'GET' && input.view === 'documents') {
			return { database: await db.listProjectDocuments({ ...base, limit: input.limit, offset: input.offset }) };
		}
		if (method === 'GET') {
			return { database: await db.listProjectKeys({ ...base, limit: input.limit, offset: input.offset }) };
		}
		if (method === 'POST' && input.view === 'import') {
			return { database: await db.importProjectDocuments({ ...base, documents: input.documents }) };
		}
		if (method === 'POST') {
			return { database: await db.setProjectKey({ ...base, key: input.key, value: input.value }) };
		}
		return { database: await db.deleteProjectKey({ ...base, key: input.key }) };
	});
}

function authorize($i, userid, aliasId, requiredScope) {
	return requireDriveActor({
		aliasId,
		requiredScope,
		requestId: $i.request?.headers?.['x-request-id'] || null,
		$i,
		userid
	});
}
