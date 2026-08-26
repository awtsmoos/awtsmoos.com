//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveEntryRouteData
 * @description
 * The Awtsmoos separates query shaping from route orchestration and gives each Drive read a measured name;
 * Awtsmoos.com keeps listing, private content response, and mutation identity here while request-value policy lives in another flame.
 */

const { listDriveEntries, getDriveEntry } = require('../queryService.js');
const { buildPrivatePathResponse } = require('../privateResponse.js');
const {
	requestId,
	routeError,
	truthy
} = require('./entryRouteValues.js');

/**
 * @description Builds a list query from current request parameters without leaking route wiring into the query service.
 * @param {string} aliasId - Alias whose Drive entries should be listed.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @returns {Promise<Object>} Drive listing result.
 */
function listEntries(aliasId, $i) {
	return listDriveEntries({
		aliasId,
		$i,
		parent: $i.$_GET.path,
		search: $i.$_GET.search,
		type: $i.$_GET.type,
		visibility: $i.$_GET.visibility,
		includeTrash: truthy($i.$_GET.includeTrash),
		recursive: truthy($i.$_GET.recursive),
		sort: $i.$_GET.sort,
		direction: $i.$_GET.direction,
		limit: $i.$_GET.limit,
		cursor: $i.$_GET.cursor
	});
}

/**
 * @description Reads either file metadata or a metered private body/HEAD response for one logical path.
 * @param {string} aliasId - Alias that owns the Drive entry.
 * @param {string} path - Logical Drive path.
 * @param {string} method - Normalized GET or HEAD method.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @returns {Promise<Object>} Entry metadata or private content response.
 * @throws {Error} When the logical entry does not exist.
 */
async function readEntry(aliasId, path, method, $i) {
	if (method === 'HEAD' || truthy($i.$_GET.content)) {
		return buildPrivatePathResponse({
			aliasId,
			path,
			method,
			headers: $i.request.headers,
			$i
		});
	}

	const entry = await getDriveEntry({ aliasId, path, $i });

	if (!entry) {
		throw routeError('ENTRY_NOT_FOUND');
	}

	return { entry };
}

/**
 * @description Builds common audited mutation identity fields from an authorized actor.
 * @param {Object} actor - Authorized owner or service actor.
 * @param {string} aliasId - Alias being mutated.
 * @param {string} path - Logical Drive path.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @returns {Object} Common service-operation options.
 */
function operationOptions(actor, aliasId, path, $i) {
	return {
		aliasId,
		path,
		actorUserId: actor.actorUserId,
		credentialId: actor.credentialId,
		requestId: requestId($i),
		$i
	};
}

module.exports = {
	listEntries,
	operationOptions,
	readEntry
};
