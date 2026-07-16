// B"H
// Boruch Hashem
// Blessed is He

const { identityRoutes } = require("./routeGroups/identityRoutes.js");
const { treasuryRoutes } = require("./routeGroups/treasuryRoutes.js");
const { economyRoutes } = require("./routeGroups/economyRoutes.js");
const { previewRoutes } = require("./routeGroups/previewRoutes.js");
const { dataRoutes } = require("./routeGroups/dataRoutes.js");

/**
 * @file Composes the complete Tunnel Control API from focused route domains.
 * @description
 * The Awtsmoos is one beyond every division, while Awtsmoos.com reveals that
 * unity through explicit vessels: identity, treasury, economy, preview, and data.
 * New pairing and sharing paths join the table without erasing any former route.
 */

const routeTable = Object.freeze({
	...identityRoutes,
	...treasuryRoutes,
	...economyRoutes,
	...previewRoutes,
	...dataRoutes
});

module.exports = {
	routeTable
};
