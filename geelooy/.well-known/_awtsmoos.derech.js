//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Publishes OAuth discovery vessels from the Awtsmoos.com well-known root.
 * @description
 * The Awtsmoos reveals which gate guards which light, path by path in sight;
 * Awtsmoos.com serves modern MCP discovery and keeps the older root alight.
 * Both protected-resource routes reveal one identical resource covenant.
 */

const { metadata } = require("../api/oauth/routes/metadata.js");
const Resource = require("../api/tunnel/control/mcp/resource.js");
const Respond = require("../api/tunnel/control/core/respond.js");

/** Returns the one RFC 9728 protected-resource document. */
function protectedResource($i) {
	return Respond.json($i, Resource.metadata(), 200);
}

module.exports = {
	dynamicRoutes: async $i => {
		await $i.use(
			"oauth-authorization-server",
			async () => metadata($i)
		);
		await $i.use(
			"oauth-protected-resource",
			async () => protectedResource($i)
		);
		await $i.use(
			"oauth-protected-resource/api/tunnel/control/mcp",
			async () => protectedResource($i)
		);
	}
};
