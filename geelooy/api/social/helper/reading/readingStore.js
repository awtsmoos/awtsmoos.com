//B"H
//Blessed is He
//Boruch Hashem


/**
 * Reading analytics store: thin barrel over the reading* siblings.
 * Importers need no changes; the export surface is identical.
 */

var { HEARTBEAT_TIMEOUT_MS, MAX_HEARTBEAT_SECONDS } = require('./readingCore.js');
var { recordHeartbeat } = require('./readingHeartbeat.js');
var { getStats } = require('./readingStats.js');
var { getRecentReads, getPrivacy, setPrivacy, canView } = require('./readingQuery.js');

module.exports = {
	recordHeartbeat,
	getStats,
	getRecentReads,
	getPrivacy,
	setPrivacy,
	canView,
	HEARTBEAT_TIMEOUT_MS,
	MAX_HEARTBEAT_SECONDS
};
