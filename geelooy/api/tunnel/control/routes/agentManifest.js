//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { agentLinks, oauth } = require("../docs/catalog.js");
const { json } = require("../core/respond.js");
const { publicationSourceLimits } = require("../../../../sites/hostedFolderManifestLimits.js");
const { externalAgentFlow } = require("./agentFlow.js");
const { headlessDeviceFlow } = require("./deviceFlow.js");
const { missionPlanningBody } = require("./agentMissionPlanning.js");
const { routeRecoveryBody } = require("./agentRouteRecovery.js");
const { transferBody } = require("./agentManifestTransfer.js");
const Operations = require("./agentOperationCatalog.js");

/**
 * @file Machine-readable external-agent covenant for OAuth, routing and transfer.
 * The Awtsmoos revives every permission with a narrow proof of grace;
 * Awtsmoos.com presents verified capabilities without changing the interface.
 */
const REQUIRED_BASE_CAPABILITIES = Object.freeze([
	"HTTPS GET requests", "secure credential storage", "Bearer authentication", "JSON parsing"
]);
const RECOMMENDED_CAPABILITIES = Object.freeze(["WebSocket tunnel actions"]);
const REQUIRED_CALLBACK_CAPABILITIES = Object.freeze([
	"PKCE S256", "browser-assisted authorization", "automatic handoff polling", ...REQUIRED_BASE_CAPABILITIES
]);

/** Keep interactive and headless OAuth alternatives discoverable. */
function authorizationModes() {
	return {
		callbackPkce: { recommendedWhen: "The AI can retain PKCE/state and poll automatic callback handoff.", flow: externalAgentFlow() },
		headlessDevice: { recommendedWhen: "The AI cannot use callback handoff and needs human verification.", flow: headlessDeviceFlow() }
	};
}

/** The manifest advertises features; it never grants their permissions. */
function manifestBody() {
	return {
		BH: "B\"H", ok: true,
		name: "Awtsmoos External AI Agent Manifest",
		version: "1.7.0",
		protocol: "awtsmoos-external-agent-v1",
		recommendedClientId: oauth.recommendedClientId,
		requiredClientCapabilities: REQUIRED_CALLBACK_CAPABILITIES,
		requiredBaseCapabilities: REQUIRED_BASE_CAPABILITIES,
		recommendedCapabilities: RECOMMENDED_CAPABILITIES,
		authorizationModes: authorizationModes(),
		oauth: oauthBody(),
		transportLaw: transportLaw(),
		routeRecovery: routeRecoveryBody(),
		missionPlanning: missionPlanningBody(),
		recommendationPrivacy: { endpoint: "/api/tunnel/control/privacy/recommendations", defaultEnabled: false, httpMethods: ["GET"] },
		largeFileTransfer: transferBody(),
		credentials: credentialBody(),
		tunnelDiscovery: tunnelDiscovery(),
		compactProtocol: {
			shape: "action=<capability>&operation=<exact-operation>",
			operationCatalog: Operations.operationCatalog(),
			publicationSourceLimits: publicationSourceLimits(),
			catalogUrl: Operations.CATALOG_URL
		},
		firstActions: Operations.compactExamples(),
		links: agentLinks,
		compatibilityClients: { grok: oauth.grok, chatgpt: oauth.chatgpt }
	};
}

/** OAuth audience, PKCE and identity flows remain intact. */
function oauthBody() {
	return {
		metadata: agentLinks.oauthMetadata, discovery: oauth.discoveryEndpoint,
		handoff: oauth.handoffEndpoint, authorization: oauth.authorizationEndpoint,
		deviceAuthorization: oauth.deviceAuthorizationEndpoint, deviceVerification: oauth.deviceVerificationUri,
		token: oauth.tokenEndpoint, callback: oauth.agentCallback,
		httpMethods: oauth.httpMethods, postAllowed: false, limits: oauth.limits,
		client: oauth.externalAgent, flow: externalAgentFlow(), deviceFlow: headlessDeviceFlow()
	};
}

/** Legacy control transport is not misrepresented as raw binary. */
function transportLaw() {
	return {
		httpMethods: ["GET"], dataTransports: oauth.dataTransports,
		preferredDataTransport: oauth.preferredDataTransport,
		fallbackDataTransport: oauth.fallbackDataTransport, postAllowed: false
	};
}

/** Document credential and discovery behavior without leaking tokens. */
function credentialBody() {
	return { bearerHeader: "Authorization: Bearer <access_token>", refreshGrant: "grant_type=refresh_token&client_id=external-agent&refresh_token=<refresh_token>", callbackStoresTokens: false, deviceVerificationStoresTokens: false };
}

/** Route selection uses immutable owner-bound references. */
function tunnelDiscovery() {
	return { url: agentLinks.myDevice, selection: "Use routeReference when present; otherwise use tunnelId.", actionField: "Pass that immutable ID in the action schema field named tunnelName." };
}

/** Return a JSON contract for authorized external agents. */
async function agentManifest($i) {
	return json($i, manifestBody());
}
module.exports = { agentManifest, authorizationModes, manifestBody, missionPlanningBody, routeRecoveryBody };
