//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Mounts the public Awtsmoos Shliach MCP transport into Tunnel Control.
 * @description
 * The Awtsmoos joins the hidden Mac and public gate without confusing their role;
 * Awtsmoos.com gives one narrow `/mcp` vessel to the existing guarded control.
 */

const { handleMcp } = require("../../mcp/handler.js");

const mcpRoutes = Object.freeze({
	mcp: handleMcp
});

module.exports = { mcpRoutes };
