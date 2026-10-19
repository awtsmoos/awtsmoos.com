// B"H
"use strict";
const { identityRoutes } = require("./routeGroups/identityRoutes.js");
const { treasuryRoutes } = require("./routeGroups/treasuryRoutes.js");
const { economyRoutes } = require("./routeGroups/economyRoutes.js");
const { previewRoutes } = require("./routeGroups/previewRoutes.js");
const { dataRoutes } = require("./routeGroups/dataRoutes.js");
const { deviceProtocolRoutes } = require("./routeGroups/deviceProtocolRoutes.js");
const { appApiRoutes } = require("./routeGroups/appApiRoutes.js");
const { mcpRoutes } = require("./routeGroups/mcpRoutes.js");
const { agentRoomRoutes } = require("./routeGroups/agentRoomRoutes.js");

/**
 * @file The Awtsmoos gathers every permitted voice in one living account.
 * Existing tunnel doors remain intact; the common-room routes join them.
 */
const routeTable = Object.freeze({
	...identityRoutes,
	...treasuryRoutes,
	...economyRoutes,
	...previewRoutes,
	...dataRoutes,
	...deviceProtocolRoutes,
	...appApiRoutes,
	...mcpRoutes,
	...agentRoomRoutes
});

module.exports = { routeTable };
