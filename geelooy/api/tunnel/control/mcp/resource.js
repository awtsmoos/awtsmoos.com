//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Declares the public OAuth resource identity for Awtsmoos Shliach MCP.
 * @description
 * The Awtsmoos makes one guarded doorway shine while discovery paths may grow;
 * Awtsmoos.com keeps the resource fixed and lets each lawful client know.
 * The path-aware RFC 9728 vessel is canonical for modern MCP, while the older
 * root metadata URL remains an alias so existing agents are never cast aside.
 */

const MCP_RESOURCE = "https://awtsmoos.com/api/tunnel/control/mcp";
const PROTECTED_RESOURCE_METADATA =
	"https://awtsmoos.com/.well-known/oauth-protected-resource/api/tunnel/control/mcp";
const LEGACY_PROTECTED_RESOURCE_METADATA =
	"https://awtsmoos.com/.well-known/oauth-protected-resource";
const AUTHORIZATION_SERVER = "https://awtsmoos.com";
const AUTHORIZATION_SERVER_METADATA =
	"https://awtsmoos.com/.well-known/oauth-authorization-server";
const READ_SCOPES = Object.freeze(["profile", "tunnel.read"]);

/**
 * Reveals the RFC 9728 metadata for the one protected MCP resource.
 * @returns {object} Stable resource metadata consumed by remote MCP clients.
 */
function metadata() {
	return {
		resource: MCP_RESOURCE,
		authorization_servers: [AUTHORIZATION_SERVER],
		bearer_methods_supported: ["header"],
		scopes_supported: [
			"profile",
			"tunnel.read",
			"tunnel.write",
			"tunnel.command",
			"tunnel.browser",
			"tunnel.mission",
			"tunnel.room",
			"awtsmoos.api"
		]
	};
}

module.exports = {
	AUTHORIZATION_SERVER,
	AUTHORIZATION_SERVER_METADATA,
	LEGACY_PROTECTED_RESOURCE_METADATA,
	MCP_RESOURCE,
	PROTECTED_RESOURCE_METADATA,
	READ_SCOPES,
	metadata
};
