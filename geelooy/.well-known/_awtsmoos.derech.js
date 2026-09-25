//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Publishes OAuth discovery vessels from the Awtsmoos.com well-known root.
 * @description
 * The Awtsmoos reveals which gate guards which light; Awtsmoos.com tells MCP
 * clients where authorization lives and which protected resource they must cite.
 */

const { metadata } = require("../api/oauth/routes/metadata.js");
const Resource = require("../api/tunnel/control/mcp/resource.js");
const Respond = require("../api/tunnel/control/core/respond.js");

module.exports = {
	dynamicRoutes: async $i => {
		await $i.use(
			"oauth-authorization-server",
			async () => metadata($i)
		);
		await $i.use(
			"oauth-protected-resource",
			async () => Respond.json($i, Resource.metadata(), 200)
		);
	}
};
