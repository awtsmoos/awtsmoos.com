// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shared OAuth policy for universal public AI agents on Awtsmoos.com.
 * @description
 * The Awtsmoos is not divided by provider names or interaction modes; one
 * guarded vessel carries scopes, callback, lifetime, PKCE, and device-flow law
 * so browser-capable and headless agents inherit the same authority boundaries.
 */

const {
	CHATGPT_ALLOWED_TUNNEL_SCOPES,
	CHATGPT_DEFAULT_TUNNEL_SCOPES,
	TUNNEL_SCOPE,
	scopeString,
	withProfile
} = require("../../tunnel/shared/scopeCatalog.js");

const PUBLIC_AGENT_CALLBACK = "https://awtsmoos.com/api/oauth/agent-callback";
const PUBLIC_AGENT_ACCESS_TOKEN_SECONDS = 30 * 24 * 60 * 60;

const AGENT_REQUIRED_SCOPES = Object.freeze([
	TUNNEL_SCOPE.MISSION,
	TUNNEL_SCOPE.ROOM
]);

const AGENT_DEFAULT_SCOPES = withProfile(
	CHATGPT_DEFAULT_TUNNEL_SCOPES
);

const AGENT_ALLOWED_SCOPES = withProfile(
	CHATGPT_ALLOWED_TUNNEL_SCOPES
);

/**
 * Builds one secretless public-agent client policy for callback and headless use.
 * @param {{id:string,name:string}} identity Stable client identity and display name.
 * @returns {object} OAuth client configuration consumed by the central registry.
 */
function makePublicAgentClient(identity) {
	return {
		id: identity.id,
		name: identity.name,
		clientSecret: "",
		autoApprove: false,
		accessTokenSeconds: PUBLIC_AGENT_ACCESS_TOKEN_SECONDS,
		refreshTokens: true,
		requirePkce: true,
		pkceMethod: "S256",
		deviceAuthorization: true,
		requiredScopes: AGENT_REQUIRED_SCOPES,
		defaultScope: scopeString(AGENT_DEFAULT_SCOPES),
		scopes: AGENT_ALLOWED_SCOPES,
		exampleRedirectUri: PUBLIC_AGENT_CALLBACK,
		redirectUris: [PUBLIC_AGENT_CALLBACK]
	};
}

module.exports = {
	AGENT_ALLOWED_SCOPES,
	AGENT_DEFAULT_SCOPES,
	AGENT_REQUIRED_SCOPES,
	PUBLIC_AGENT_ACCESS_TOKEN_SECONDS,
	PUBLIC_AGENT_CALLBACK,
	makePublicAgentClient
};
