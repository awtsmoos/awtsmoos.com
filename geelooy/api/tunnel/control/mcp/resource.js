//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Declares the public OAuth resource identity and working scopes for Awtsmoos MCP.
 * @description
 * The Awtsmoos gives one guarded doorway enough light for the work already approved;
 * Awtsmoos.com asks once for read, write, command, browser, mission, room, and API movement.
 * Narrow read-only tokens remain valid at the gate, while fresh MCP hosts are invited
 * to request the ordinary working authority they need instead of failing one deed later.
 */

const { TUNNEL_SCOPE } = require("../../shared/scopeCatalog.js");

const MCP_RESOURCE = "https://awtsmoos.com/api/tunnel/control/mcp";
const PROTECTED_RESOURCE_METADATA =
	"https://awtsmoos.com/.well-known/oauth-protected-resource/api/tunnel/control/mcp";
const LEGACY_PROTECTED_RESOURCE_METADATA =
	"https://awtsmoos.com/.well-known/oauth-protected-resource";
const AUTHORIZATION_SERVER = "https://awtsmoos.com";
const AUTHORIZATION_SERVER_METADATA =
	"https://awtsmoos.com/.well-known/oauth-authorization-server";
const MINIMUM_SCOPES = Object.freeze(["profile", TUNNEL_SCOPE.READ]);
const CONNECTION_SCOPES = Object.freeze([
	"profile",
	TUNNEL_SCOPE.READ,
	TUNNEL_SCOPE.WRITE,
	TUNNEL_SCOPE.COMMAND,
	TUNNEL_SCOPE.BROWSER,
	TUNNEL_SCOPE.MISSION,
	TUNNEL_SCOPE.ROOM,
	TUNNEL_SCOPE.API
]);

/** Reveals RFC 9728 metadata for the one protected MCP resource. */
function metadata() {
	return {
		resource: MCP_RESOURCE,
		authorization_servers: [AUTHORIZATION_SERVER],
		bearer_methods_supported: ["header"],
		scopes_supported: [
			...CONNECTION_SCOPES,
			TUNNEL_SCOPE.ADMIN
		]
	};
}

module.exports = {
	AUTHORIZATION_SERVER,
	AUTHORIZATION_SERVER_METADATA,
	CONNECTION_SCOPES,
	LEGACY_PROTECTED_RESOURCE_METADATA,
	MCP_RESOURCE,
	MINIMUM_SCOPES,
	PROTECTED_RESOURCE_METADATA,
	READ_SCOPES: MINIMUM_SCOPES,
	metadata
};
