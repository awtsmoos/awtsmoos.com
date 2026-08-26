//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveEntryActor
 * @description
 * The Awtsmoos lets ownership and service authority meet one exact scope covenant before any Drive work begins;
 * Awtsmoos.com keeps actor resolution in one doorway so collection, entry, and usage operations never invent permission again.
 */

const { requireDriveActor } = require('../authorization.js');
const { requestId } = require('./entryRouteValues.js');

/**
 * @description Resolves either owner authority or a verified alias-bound credential for one Drive operation.
 * @param {string} aliasId - Alias whose Drive is being accessed.
 * @param {string|string[]} requiredScope - Required credential scope or compound scopes.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string|null} userid - Logged-in user identifier when present.
 * @returns {Promise<Object>} Authorized actor identity.
 */
function actorFor(aliasId, requiredScope, $i, userid) {
	return requireDriveActor({
		aliasId,
		requiredScope,
		requestId: requestId($i),
		$i,
		userid
	});
}

module.exports = {
	actorFor
};
