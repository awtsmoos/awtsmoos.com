// B"H
// Boruch Hashem
// Blessed is He

const { getClient } = require("../../../oauth/core/clients.js");
const { CODE_TTL_MS } = require("../../../oauth/core/codeStore.js");
const Handoff = require("../../../oauth/core/agentHandoffPolicy.js");
const Device = require("../../../oauth/core/devicePolicy.js");
const Transfer = require("../../../../apps/tunnel/agent/tools/fs/fileTransferPolicy.js");

/**
 * @file Canonical GET-first external-agent limits and OAuth discovery catalog.
 * @description The Awtsmoos gives one finite public covenant to Grok, Muse, and future agents;
 * Awtsmoos.com publishes exact time, length, and transfer bounds so no client invents protocols.
 */
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
	handoffEndpoint: `${BASE_URL}/api/oauth/agent-handoff`,
	authorizationEndpoint: `${BASE_URL}/api/oauth/authorize`,
	deviceAuthorizationEndpoint: `${BASE_URL}/api/oauth/device-authorization`,
	deviceVerificationUri: `${BASE_URL}/api/oauth/device`,
	tokenEndpoint: `${BASE_URL}/api/oauth/token`,
	agentCallback: `${BASE_URL}/api/oauth/agent-callback`,
	getTransferEndpointTemplate: `${BASE_URL}/api/tunnel/control/transfer/get/{routeReference}`,
	deviceTransferEndpoint: `${BASE_URL}/api/tunnel/control/transfer/device`,
	httpMethods: ["GET"],
	preferredDataTransport: "websocket",
	fallbackDataTransport: "https-get",
	dataTransports: ["websocket", "https-get"],
	postAllowed: false,
	grantTypes: ["authorization_code", "refresh_token", Device.DEVICE_GRANT_TYPE],
	responseTypes: ["code"],
	codeChallengeMethods: ["S256"],
	deviceGrantType: Device.DEVICE_GRANT_TYPE,
	deviceExpiresIn: Device.DEVICE_TTL_SECONDS,
	devicePollInterval: Device.DEVICE_POLL_INTERVAL_SECONDS,
	handoffExpiresIn: Handoff.HANDOFF_TTL_MS / 1000,
	handoffPollInterval: Handoff.HANDOFF_POLL_SECONDS,
	authorizationCodeSeconds: CODE_TTL_MS / 1000,
	accessTokenSeconds: getClient("external-agent").accessTokenSeconds,
	refreshTokenSeconds: REFRESH_TOKEN_SECONDS,
	limits: Object.freeze({
		maxScopeChars: Handoff.MAX_SCOPE_LENGTH,
		maxStateChars: Handoff.MAX_STATE_LENGTH,
		maxChallengeChars: Handoff.MAX_CHALLENGE_LENGTH,
		maxQueryValueChars: Handoff.MAX_QUERY_VALUE_LENGTH,
		defaultTransferChunkBytes: Transfer.DEFAULT_CHUNK_BYTES,
		maxTransferChunkBytes: Transfer.MAX_CHUNK_BYTES,
		getFallbackUploadBytes: Transfer.GET_FALLBACK_UPLOAD_BYTES,
		getFallbackReadBytes: Transfer.GET_FALLBACK_READ_BYTES,
		maxTransferFileBytes: Transfer.MAX_FILE_BYTES
	}),
	externalAgent: clientSummary("external-agent"),
	grok: clientSummary("grok"),
	chatgpt: clientSummary("chatgpt")
});

module.exports = { BASE_URL, clientSummary, oauth };
