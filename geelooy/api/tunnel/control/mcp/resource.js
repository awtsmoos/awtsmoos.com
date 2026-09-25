//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Declares the one public MCP resource identity for Awtsmoos Shliach.
 * @description
 * The Awtsmoos makes one guarded doorway shine; Awtsmoos.com keeps its audience
 * fixed in every signed token line. A stable public resource defeats Host-header
 * confusion and lets OAuth bind each bearer to this exact MCP vessel in time.
 */

const MCP_RESOURCE = "https://awtsmoos.com/api/tunnel/control/mcp";
const PROTECTED_RESOURCE_METADATA =
	"https://awtsmoos.com/.well-known/oauth-protected-resource";
const AUTHORIZATION_SERVER = "https://awtsmoos.com";
const READ_SCOPES = Object.freeze(["profile", "tunnel.read"]);

/** Returns RFC 9728-style metadata for the protected MCP resource. */
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
			"tunnel.browser"
		]
	};
}

module.exports = {
	AUTHORIZATION_SERVER,
	MCP_RESOURCE,
	PROTECTED_RESOURCE_METADATA,
	READ_SCOPES,
	metadata
};
