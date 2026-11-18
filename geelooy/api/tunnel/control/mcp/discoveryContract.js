//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file One machine-readable remote MCP covenant for Awtsmoos.com.
 * @description
 * The Awtsmoos is One while hosts and transports wear many names;
 * Awtsmoos.com gives every lawful agent the same discovery flames.
 * This module contains no credentials and performs no authorization itself.
 */

const Resource = require("./resource.js");

const PROTOCOL_VERSIONS = Object.freeze([
	"2026-07-28",
	"2025-11-25",
	"2025-03-26"
]);

/**
 * Builds the public MCP discovery contract consumed by docs and manifests.
 * @returns {object} Declarative connection metadata with no secret state.
 */
function contract() {
	return {
		endpoint: Resource.MCP_RESOURCE,
		transport: "streamable-http",
		stateless: true,
		httpMethods: ["POST"],
		oauthChallengeProbeMethods: ["GET", "POST"],
		protocolVersions: [...PROTOCOL_VERSIONS],
		authorization: {
			protectedResourceMetadata: Resource.PROTECTED_RESOURCE_METADATA,
			legacyProtectedResourceMetadata: Resource.LEGACY_PROTECTED_RESOURCE_METADATA,
			authorizationServerMetadata: Resource.AUTHORIZATION_SERVER_METADATA,
			resource: Resource.MCP_RESOURCE,
			requiredScopes: [...Resource.READ_SCOPES],
			clientRegistration: "Use the authorization server discovery metadata; remote MCP hosts may dynamically register their own public OAuth client."
		},
		connectionSequence: [
			"Connect to endpoint and follow the HTTP 401 WWW-Authenticate resource_metadata challenge.",
			"Complete OAuth for the exact MCP resource audience and retain the bearer credential in the host.",
			"POST server/discover for 2026-07-28 or initialize for handshake-era MCP clients.",
			"Call tools/list, then awtsmoos_discover_device to obtain an immutable routeReference.",
			"Use awtsmoos_action_schema before unfamiliar actions, then invoke the narrowest tool required."
		]
	};
}

module.exports = {
	PROTOCOL_VERSIONS,
	contract
};
