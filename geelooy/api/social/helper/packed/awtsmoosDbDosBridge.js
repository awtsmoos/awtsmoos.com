//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module awtsmoosDbDosBridge
 * @description
 * Barrel for awtsmoosDbDosBridge: re-exports the identical surface from its sibling modules.
 */

const { AwtsmoosDbDosBridge } = require('./awtsmoosDbDosBridgeRest.js');
const { familyDbFiles, familyForPath } = require('./awtsmoosDbFamilies.js');

module.exports = {
	AwtsmoosDbDosBridge,
	familyDbFiles,
	familyForPath
};
