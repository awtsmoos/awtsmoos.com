//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Builds the stable sections of the external-agent machine manifest.
 * @description
 * The Awtsmoos pours one light through OAuth, routing, and legacy control;
 * Awtsmoos.com keeps each vessel named, bounded, and whole.
 */

const { agentLinks, oauth } = require("../docs/catalog.js");
const { externalAgentFlow } = require("./agentFlow.js");
const { headlessDeviceFlow } = require("./deviceFlow.js");

const REQUIRED_BASE_CAPABILITIES = Object.freeze([
	"HTTPS GET requests",
	"secure credential storage",
	"Bearer authentication",
	"JSON parsing"
]);
const RECOMMENDED_CAPABILITIES = Object.freeze([
	"WebSocket tunnel actions",
	"Remote MCP"
]);
const REQUIRED_CALLBACK_CAPABILITIES = Object.freeze([
	"PKCE S256",
	"browser-assisted authorization",
	"automatic handoff polling",
	...REQUIRED_BASE_CAPABILITIES
]);

/** Returns the supported interactive and headless Awtsmoos OAuth modes. */
function authorizationModes() {
	return {
		callbackPkce: {
			recommendedWhen: "The AI can retain PKCE/state and poll automatic callback handoff.",
			flow: externalAgentFlow()
		},
		headlessDevice: {
			recommendedWhen: "The AI cannot use callback handoff and needs human verification.",
			flow: headlessDeviceFlow()
		}
	};
}

/** Returns the provider-neutral OAuth contract used outside hosted MCP flows. */
function oauthBody() {
	return {
		metadata: agentLinks.oauthMetadata,
		discovery: oauth.discoveryEndpoint,
		handoff: oauth.handoffEndpoint,
		authorization: oauth.authorizationEndpoint,
		deviceAuthorization: oauth.deviceAuthorizationEndpoint,
		deviceVerification: oauth.deviceVerificationUri,
		token: oauth.tokenEndpoint,
		callback: oauth.agentCallback,
		httpMethods: oauth.httpMethods,
		postAllowed: false,
		limits: oauth.limits,
		client: oauth.externalAgent,
		flow: externalAgentFlow(),
		deviceFlow: headlessDeviceFlow()
	};
}

/** Describes only the legacy direct-control transport, never the MCP endpoint. */
function transportLaw() {
	return {
		purpose: "legacy-direct-control",
		httpMethods: ["GET"],
		dataTransports: oauth.dataTransports,
		preferredDataTransport: oauth.preferredDataTransport,
		fallbackDataTransport: oauth.fallbackDataTransport,
		postAllowed: false,
		mcpContractField: "mcp"
	};
}

/** Documents credential carriage without returning any credential. */
function credentialBody() {
	return {
		bearerHeader: "Authorization: Bearer <access_token>",
		refreshGrant: "grant_type=refresh_token&client_id=external-agent&refresh_token=<refresh_token>",
		callbackStoresTokens: false,
		deviceVerificationStoresTokens: false
	};
}

/** Documents immutable route selection after authorization. */
function tunnelDiscovery() {
	return {
		url: agentLinks.myDevice,
		selection: "Use routeReference when present; otherwise use tunnelId.",
		actionField: "Pass that immutable ID in the action schema field named tunnelName."
	};
}

module.exports = {
	RECOMMENDED_CAPABILITIES,
	REQUIRED_BASE_CAPABILITIES,
	REQUIRED_CALLBACK_CAPABILITIES,
	authorizationModes,
	credentialBody,
	oauthBody,
	transportLaw,
	tunnelDiscovery
};
