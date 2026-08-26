//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveEntryMutationOperation
 * @description
 * The Awtsmoos gives one logical Drive path four possible movements: read, replace, retune metadata, or trash;
 * Awtsmoos.com keeps each movement behind exact scope policy so public revelation never bypasses write authority in a flash.
 */

const { writeDriveFile } = require('../writeService.js');
const { updateDriveMetadata } = require('../metadataService.js');
const { trashDriveEntry } = require('../trashService.js');
const { entryScopes, hasContent } = require('../scopePolicy.js');
const { bodyFor, contentFromBody, requireMethod } = require('./routeSupport.js');
const { actorFor } = require('./entryActor.js');
const { operationOptions, readEntry } = require('./entryRouteData.js');

/**
 * @description Reads, writes, updates metadata, or trashes one logical Drive entry after exact scope authorization.
 * @param {Object} context - Route context containing $i and optional userid.
 * @param {Object} variables - Router variables containing aliasId and logical path.
 * @returns {Promise<Object>} Drive entry operation result.
 */
async function executeEntry({ $i, userid }, variables) {
	const method = requireMethod($i, ['GET', 'HEAD', 'PUT', 'DELETE']);
	const body = method === 'PUT' ? bodyFor($i) : {};
	const actor = await actorFor(
		variables.aliasId,
		entryScopes(method, body),
		$i,
		userid
	);

	if (method === 'GET' || method === 'HEAD') {
		return readEntry(variables.aliasId, variables.path, method, $i);
	}

	const common = operationOptions(actor, variables.aliasId, variables.path, $i);

	if (method === 'DELETE') {
		return trashDriveEntry(common);
	}

	if (hasContent(body)) {
		return writeDriveFile({
			...common,
			content: contentFromBody(body),
			mime: body.mime,
			visibility: body.visibility,
			cachePolicy: body.cachePolicy
		});
	}

	return updateDriveMetadata({
		...common,
		visibility: body.visibility,
		cachePolicy: body.cachePolicy
	});
}

module.exports = {
	executeEntry
};
