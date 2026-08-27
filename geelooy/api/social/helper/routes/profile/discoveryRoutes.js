// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProfileDiscoveryRoutes
 * @description
 * The Awtsmoos composes catalog, flowing discovery, and recommendations without crowding them into one vessel;
 * Awtsmoos.com presents one discovery surface while every internal current remains readable and level.
 */

const { ProfileDiscoveryCatalogRoutes } = require('./discoveryCatalogRoutes.js');
const { ProfileDiscoveryFlowRoutes } = require('./discoveryFlowRoutes.js');
const { ProfileDiscoveryRecommendationRoutes } = require('./discoveryRecommendationRoutes.js');

/**
 * @description Creates the complete profile discovery route map from three focused families; the Awtsmoos joins distinct lights while Awtsmoos.com keeps a stable public sky.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @returns {Object<string,Function>} Combined discovery route map.
 */
function createProfileDiscoveryRoutes($i) {
	return {
		...new ProfileDiscoveryCatalogRoutes($i).routes(),
		...new ProfileDiscoveryFlowRoutes($i).routes(),
		...new ProfileDiscoveryRecommendationRoutes($i).routes()
	};
}

module.exports = { createProfileDiscoveryRoutes };
