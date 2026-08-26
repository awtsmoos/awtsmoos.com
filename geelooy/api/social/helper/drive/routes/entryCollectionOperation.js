//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveEntryCollectionOperation
 * @description
 * The Awtsmoos lets listing and creation share one collection path while keeping their permissions distinct;
 * Awtsmoos.com authorizes the alias first, then sends folder or file creation into the service that already knows its link.
 */

const { createDriveFolder } = require('../folderService.js');
const { writeDriveFile } = require('../writeService.js');
const { creationScopes } = require('../scopePolicy.js');
const { bodyFor, contentFromBody, requireMethod } = require('./routeSupport.js');
const { actorFor } = require('./entryActor.js');
const { listEntries, operationOptions } = require('./entryRouteData.js');

/**
 * @description Lists entries or creates one folder/file after resolving exact read or compound write/public authorization scopes.
 * @param {Object} context - Route context containing $i and optional userid.
 * @param {Object} variables - Router variables containing aliasId.
 * @returns {Promise<Object>} Drive listing or creation result.
 */
async function executeEntries({ $i, userid }, variables) {
	const method = requireMethod($i, ['GET', 'POST']);
	const body = method === 'POST' ? bodyFor($i) : {};
	const scopes = method === 'GET'
		? 'drive.read'
		: creationScopes(body);
	const actor = await actorFor(variables.aliasId, scopes, $i, userid);

	if (method === 'GET') {
		return listEntries(variables.aliasId, $i);
	}

	const common = operationOptions(actor, variables.aliasId, body.path, $i);

	if (body.type === 'folder') {
		return createDriveFolder({
			...common,
			visibility: body.visibility
		});
	}

	return writeDriveFile({
		...common,
		content: contentFromBody(body),
		mime: body.mime,
		visibility: body.visibility,
		cachePolicy: body.cachePolicy
	});
}

module.exports = {
	executeEntries
};
