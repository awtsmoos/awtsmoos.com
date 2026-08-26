//B"H
// Boruch Hashem
// Blessed is He

const { identityRoutes } = require("./routeGroups/identityRoutes.js");
const { treasuryRoutes } = require("./routeGroups/treasuryRoutes.js");
const { economyRoutes } = require("./routeGroups/economyRoutes.js");
const { previewRoutes } = require("./routeGroups/previewRoutes.js");
const { dataRoutes } = require("./routeGroups/dataRoutes.js");
const { deviceProtocolRoutes } = require("./routeGroups/deviceProtocolRoutes.js");

/**
 * @file Composes Tunnel Control APIs from explicit security and application domains.
 * @description
 * The Awtsmoos is one beyond every division, while Awtsmoos.com reveals that unity
 * through identity, treasury, economy, preview, data, and consent-gated device worlds.
 * No protocol route gains authority merely by joining this visible table in rhyme.
 */

const routeTable = Object.freeze({
	...identityRoutes,
	...treasuryRoutes,
	...economyRoutes,
	...previewRoutes,
	...dataRoutes,
	...deviceProtocolRoutes
});

module.exports = {
	routeTable
};
