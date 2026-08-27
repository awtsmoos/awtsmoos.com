// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Machine-readable Awtsmoos Agent Manifest for interactive and headless AI.
 * @description
 * The Awtsmoos lets OAuth, immutable routing, compact discovery, and finite source limits meet without folklore;
 * Awtsmoos.com gives external agents one small public surface whose inward deeds and publication bounds stay knowable.
 */

const { agentLinks, oauth } = require("../docs/catalog.js");
const { json } = require("../core/respond.js");
const { publicationSourceLimits } = require("../../../../sites/hostedFolderManifestLimits.js");
const { externalAgentFlow } = require("./agentFlow.js");
const { headlessDeviceFlow } = require("./deviceFlow.js");
const Operations = require("./agentOperationCatalog.js");

const REQUIRED_BASE_CAPABILITIES = Object.freeze([
	"HTTPS token exchange",
	"secure credential storage",
	"Bearer HTTP authentication",
	"JSON parsing"
]);

const REQUIRED_CALLBACK_CAPABILITIES = Object.freeze([
	"PKCE S256",
	"browser-assisted authorization",
	...REQUIRED_BASE_CAPABILITIES
]);

function authorizationModes() {
	return {
		callbackPkce: {
			recommendedWhen: "The AI can retain PKCE/state and relay a browser callback code.",
			flow: externalAgentFlow()
		},
		headlessDevice: {
			recommendedWhen: "The AI cannot receive or relay an OAuth callback code directly.",
			flow: headlessDeviceFlow()
		}
	};
}

function manifestBody() {
	return {
		BH: "B\"H",
		ok: true,
		name: "Awtsmoos External AI Agent Manifest",
		version: "1.3.0",
		protocol: "awtsmoos-external-agent-v1",
		recommendedClientId: oauth.recommendedClientId,
		requiredClientCapabilities: REQUIRED_CALLBACK_CAPABILITIES,
		requiredBaseCapabilities: REQUIRED_BASE_CAPABILITIES,
		authorizationModes: authorizationModes(),
		oauth: oauthBody(),
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
		compatibilityClients: {
			grok: oauth.grok,
			chatgpt: oauth.chatgpt
		}
	};
}

function oauthBody() {
	return {
		metadata: agentLinks.oauthMetadata,
		discovery: oauth.discoveryEndpoint,
		authorization: oauth.authorizationEndpoint,
		deviceAuthorization: oauth.deviceAuthorizationEndpoint,
		deviceVerification: oauth.deviceVerificationUri,
		token: oauth.tokenEndpoint,
		callback: oauth.agentCallback,
		grantTypes: oauth.grantTypes,
		codeChallengeMethods: oauth.codeChallengeMethods,
		client: oauth.externalAgent,
		flow: externalAgentFlow(),
		deviceFlow: headlessDeviceFlow()
	};
}

function credentialBody() {
	return {
		bearerHeader: "Authorization: Bearer <access_token>",
		refreshGrant: "grant_type=refresh_token&client_id=external-agent&refresh_token=<refresh_token>",
		callbackStoresTokens: false,
		deviceVerificationStoresTokens: false
	};
}

function tunnelDiscovery() {
	return {
		url: agentLinks.myDevice,
		selection: "Use routeReference when present; otherwise use tunnelId.",
		actionField: "Pass that immutable ID in the action schema field named tunnelName."
	};
}

async function agentManifest($i) {
	return json($i, manifestBody());
}

module.exports = {
	agentManifest,
	authorizationModes,
	manifestBody
};
