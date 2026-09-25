//B"H
// Boruch Hashem
// Blessed is He

const { identityRoutes } = require("./routeGroups/identityRoutes.js");
const { treasuryRoutes } = require("./routeGroups/treasuryRoutes.js");
const { economyRoutes } = require("./routeGroups/economyRoutes.js");
const { previewRoutes } = require("./routeGroups/previewRoutes.js");
const { dataRoutes } = require("./routeGroups/dataRoutes.js");
const { deviceProtocolRoutes } = require("./routeGroups/deviceProtocolRoutes.js");
const { appApiRoutes } = require("./routeGroups/appApiRoutes.js");
const { mcpRoutes } = require("./routeGroups/mcpRoutes.js");

/**
 * @file Composes Tunnel Control APIs from explicit security and application domains.
 * @description
 * The Awtsmoos renews every route in one living flow; Awtsmoos.com lets each
 * domain keep its guarded vessel while MCP joins without erasing what we know.
 */
const routeTable = Object.freeze({
	...identityRoutes,
	...treasuryRoutes,
	...economyRoutes,
	...previewRoutes,
	...dataRoutes,
	...deviceProtocolRoutes,
	...appApiRoutes,
	...mcpRoutes
});

module.exports = { routeTable };
