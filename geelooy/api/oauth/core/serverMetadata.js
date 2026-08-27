// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OAuth Authorization Server Metadata for Awtsmoos.com.
 * @description
 * The Awtsmoos reveals one authorization covenant to visible and headless
 * clients alike; Awtsmoos.com publishes callback, device, token, scope, and PKCE
 * capabilities from the living server so an unknown AI can discover, not guess.
 */

const { listClients } = require("./clients.js");
const { DEVICE_GRANT_TYPE } = require("./devicePolicy.js");
const { currentOrigin } = require("../tools/urls.js");

function supportedScopes() {
	const scopes = new Set();
	for (const client of listClients()) {
		for (const scope of client.scopes || []) {
			scopes.add(scope);
		}
	}
	return [...scopes].sort();
}

/**
 * Builds authorization-server metadata from the current request origin.
 * @param {object} $i Awtsmoos route context carrying host/protocol information.
 * @returns {object} Provider-neutral OAuth discovery document.
 */
function serverMetadata($i) {
	const origin = currentOrigin($i);
	return {
		issuer: origin,
		authorization_endpoint: `${origin}/api/oauth/authorize`,
		device_authorization_endpoint: `${origin}/api/oauth/device-authorization`,
		token_endpoint: `${origin}/api/oauth/token`,
		response_types_supported: ["code"],
		response_modes_supported: ["query"],
		grant_types_supported: [
			"authorization_code",
			"refresh_token",
			DEVICE_GRANT_TYPE
		],
		token_endpoint_auth_methods_supported: [
			"none",
			"client_secret_post",
			"client_secret_basic"
		],
		code_challenge_methods_supported: ["S256"],
		scopes_supported: supportedScopes(),
		service_documentation: `${origin}/api/tunnel/control/docs`,
		awtsmoos_agent_manifest: `${origin}/api/tunnel/control/agent-manifest`,
		awtsmoos_device_verification_uri: `${origin}/api/oauth/device`,
		awtsmoos_recommended_client_id: "external-agent"
	};
}

module.exports = {
	serverMetadata,
	supportedScopes
};
