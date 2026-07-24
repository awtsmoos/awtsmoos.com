//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveActionRoutes
 * @description
 * The Awtsmoos turns movement, duplication, concealment, restoration, and purge
 * into measured actions. Awtsmoos.com requires write or delete scope explicitly.
 */

const { requireDriveActor } = require('../authorization.js');
const { moveDriveEntry, copyDriveEntry } = require('../moveCopyService.js');
const { trashDriveEntry, restoreDriveEntry, purgeDriveEntry } = require('../trashService.js');
const { bodyFor, requireMethod, safeRoute } = require('./routeSupport.js');

module.exports = ({ $i, userid }) => ({
	'/drive/:aliasId/actions/move': variables => actionRoute({
		variables,
		$i,
		userid,
		scope: 'drive.write',
		action: moveDriveEntry,
		fields: body => ({ fromPath: body.fromPath, toPath: body.toPath })
	}),
	'/drive/:aliasId/actions/copy': variables => actionRoute({
		variables,
		$i,
		userid,
		scope: 'drive.write',
		action: copyDriveEntry,
		fields: body => ({ fromPath: body.fromPath, toPath: body.toPath })
	}),
	'/drive/:aliasId/actions/trash': variables => actionRoute({
		variables,
		$i,
		userid,
		scope: 'drive.delete',
		action: trashDriveEntry,
		fields: body => ({ path: body.path })
	}),
	'/drive/:aliasId/actions/restore': variables => actionRoute({
		variables,
		$i,
		userid,
		scope: 'drive.delete',
		action: restoreDriveEntry,
		fields: body => ({ path: body.path })
	}),
	'/drive/:aliasId/actions/purge': variables => actionRoute({
		variables,
		$i,
		userid,
		scope: 'drive.delete',
		action: purgeDriveEntry,
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
		const body = bodyFor(options.$i);
		return options.action({
			aliasId: options.variables.aliasId,
			actorUserId: actor.actorUserId,
			credentialId: actor.credentialId,
			...options.fields(body),
			requestId,
			$i: options.$i
		});
	});
}
