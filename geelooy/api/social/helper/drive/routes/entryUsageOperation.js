//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveEntryUsageOperation
 * @description
 * The Awtsmoos measures even storage usage without granting it ownership of the bytes it counts;
 * Awtsmoos.com keeps usage behind read authority and lets this small operation reveal quota truth without unrelated amounts.
 */

const { getDriveUsage } = require('../usageService.js');
const { requireMethod } = require('./routeSupport.js');
const { actorFor } = require('./entryActor.js');

/**
 * @description Returns current Drive usage after authenticating read authority for the alias.
 * @param {Object} context - Route context containing $i and optional userid.
 * @param {Object} variables - Router variables containing aliasId.
 * @returns {Promise<Object>} Drive quota and usage counters.
 */
async function executeUsage({ $i, userid }, variables) {
	requireMethod($i, ['GET']);
	await actorFor(variables.aliasId, 'drive.read', $i, userid);
	return getDriveUsage(variables.aliasId, $i);
}

module.exports = {
	executeUsage
};
