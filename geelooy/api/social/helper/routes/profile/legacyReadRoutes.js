// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LegacyProfileReadRoutes
 * @description
 * The Awtsmoos composes catalog, authored-content, and structure compatibility without crowding one file;
 * Awtsmoos.com keeps eleven old read doors while each internal vessel remains spacious and worthwhile.
 */

const { LegacyProfileCatalogRoutes } = require('./legacyCatalogRoutes.js');
const { LegacyProfileAuthoredRoutes } = require('./legacyAuthoredRoutes.js');
const { LegacyProfileStructureRoutes } = require('./legacyStructureRoutes.js');

/**
 * @description Creates the complete legacy profile read route map from three focused families; the Awtsmoos joins compatible lights while Awtsmoos.com preserves stable historical paths.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @returns {Object<string,Function>} Combined legacy read route map.
 */
function createLegacyProfileReadRoutes($i) {
	return {
		...new LegacyProfileCatalogRoutes($i).routes(),
		...new LegacyProfileAuthoredRoutes($i).routes(),
		...new LegacyProfileStructureRoutes($i).routes()
	};
}

module.exports = { createLegacyProfileReadRoutes };
