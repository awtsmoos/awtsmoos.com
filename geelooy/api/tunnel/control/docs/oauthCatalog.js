// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provider-neutral OAuth catalog for Awtsmoos Tunnel Control.
 * @description
 * The Awtsmoos gives one authorization light callback and headless garments;
 * Awtsmoos.com publishes the universal client first, including device consent,
 * while Grok and ChatGPT remain compatibility summaries rather than protocol law.
 */

const { getClient } = require("../../../oauth/core/clients.js");
const { CODE_TTL_MS } = require("../../../oauth/core/codeStore.js");
const DevicePolicy = require("../../../oauth/core/devicePolicy.js");

const BASE_URL = "https://awtsmoos.com";
const REFRESH_TOKEN_SECONDS = 30 * 24 * 60 * 60;

function clientSummary(id) {
	const client = getClient(id);
	return Object.freeze({
		clientId: client.id,
		name: client.name,
		redirectUri: client.exampleRedirectUri,
		requiresClientSecret: Boolean(client.clientSecret),
		pkceRequired: Boolean(client.requirePkce),
		pkceMethod: client.pkceMethod || "",
		deviceAuthorization: Boolean(client.deviceAuthorization),
		defaultScope: client.defaultScope,
		allowedScopes: client.scopes
	});
}

const oauth = Object.freeze({
	recommendedClientId: "external-agent",
	metadataEndpoint: `${BASE_URL}/.well-known/oauth-authorization-server`,
	metadataAlias: `${BASE_URL}/api/oauth/metadata`,
	discoveryEndpoint: `${BASE_URL}/api/oauth/start`,
	authorizationEndpoint: `${BASE_URL}/api/oauth/authorize`,
	deviceAuthorizationEndpoint: `${BASE_URL}/api/oauth/device-authorization`,
	deviceVerificationUri: `${BASE_URL}/api/oauth/device`,
	tokenEndpoint: `${BASE_URL}/api/oauth/token`,
	agentCallback: `${BASE_URL}/api/oauth/agent-callback`,
	grantTypes: [
		"authorization_code",
		"refresh_token",
		DevicePolicy.DEVICE_GRANT_TYPE
	],
	responseTypes: ["code"],
	codeChallengeMethods: ["S256"],
	deviceGrantType: DevicePolicy.DEVICE_GRANT_TYPE,
	deviceExpiresIn: DevicePolicy.DEVICE_TTL_SECONDS,
	devicePollInterval: DevicePolicy.DEVICE_POLL_INTERVAL_SECONDS,
	externalAgent: clientSummary("external-agent"),
	grok: clientSummary("grok"),
	chatgpt: clientSummary("chatgpt"),
	authorizationCodeSeconds: CODE_TTL_MS / 1000,
	accessTokenSeconds: getClient("external-agent").accessTokenSeconds,
	refreshTokenSeconds: REFRESH_TOKEN_SECONDS
});

module.exports = {
	BASE_URL,
	clientSummary,
	oauth
};
