//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module connectionsIndex
 * @description
 * Barrel for connectionsIndex: re-exports the identical surface from its sibling modules.
 */

const { clearConnectionsCache, loadConnectionsData } = require('./connectionsIndexLoad.js');
const { INDEX_DIR } = require('./connectionsIndexNormalize.js');

module.exports = {
	loadConnectionsData,
	clearConnectionsCache,
	INDEX_DIR
};
