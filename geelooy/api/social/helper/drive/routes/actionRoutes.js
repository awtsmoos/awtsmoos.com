//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveActionRoutes
 * @description
 * The Awtsmoos turns movement, duplication, publication, concealment, and restoration
 * into measured actions. Awtsmoos.com requires both write and public authority before
 * a source manifest may become bytes served by a canonical website.
 */

const { requireDriveActor } = require('../authorization.js');
const { moveDriveEntry, copyDriveEntry } = require('../moveCopyService.js');
const { trashDriveEntry, restoreDriveEntry, purgeDriveEntry } = require('../trashService.js');
const { bootstrapSiteProject } = require('../siteProjectBootstrap.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/actions/move': variables => actionRoute({
		variables, $i, userid, scope: 'drive.write', action: moveDriveEntry,
		fields: body => ({ fromPath: body.fromPath, toPath: body.toPath })
	}),
	'/drive/:aliasId/actions/copy': variables => actionRoute({
		variables, $i, userid, scope: 'drive.write', action: copyDriveEntry,
		fields: body => ({ fromPath: body.fromPath, toPath: body.toPath })
	}),
	'/drive/:aliasId/actions/bootstrap-site-project': variables => actionRoute({
		variables,
		$i,
		userid,
		scope: ['drive.write', 'drive.public'],
		action: bootstrapSiteProject,
		fields: bootstrapFields
	}),
	'/drive/:aliasId/actions/trash': variables => actionRoute({
		variables, $i, userid, scope: 'drive.delete', action: trashDriveEntry,
		fields: body => ({ path: body.path })
	}),
	'/drive/:aliasId/actions/restore': variables => actionRoute({
		variables, $i, userid, scope: 'drive.delete', action: restoreDriveEntry,
		fields: body => ({ path: body.path })
	}),
	'/drive/:aliasId/actions/purge': variables => actionRoute({
		variables, $i, userid, scope: 'drive.delete', action: purgeDriveEntry,
		fields: body => ({ path: body.path })
	})
});

function actionRoute(options) {
	return safeRoute(async () => {
		requireMethod(options.$i, ['POST']);
		const requestId = options.$i.request.headers?.['x-request-id'] || null;
		const actor = await requireDriveActor({
			aliasId: options.variables.aliasId,
			requiredScope: options.scope,
			requestId,
			$i: options.$i,
			userid: options.userid
		});
		return options.action({
			aliasId: options.variables.aliasId,
			actor,
			actorUserId: actor.actorUserId,
			credentialId: actor.credentialId,
			...options.fields(bodyFor(options.$i)),
			requestId,
			$i: options.$i
		});
	});
}

function bootstrapFields(body) {
	return {
		projectId: body.projectId,
		siteId: body.siteId,
		rootPath: body.rootPath,
		name: body.name,
		title: body.title,
		runtimePreference: body.runtimePreference,
		bindings: body.bindings,
		providerIntents: body.providerIntents,
		enabled: body.enabled,
		primary: body.primary,
		subdomainRequested: body.subdomainRequested,
		sourceVessel: body.sourceVessel,
		files: body.files
	};
}
