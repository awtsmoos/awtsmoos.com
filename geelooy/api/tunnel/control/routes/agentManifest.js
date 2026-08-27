// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Machine-readable Awtsmoos Agent Manifest for interactive and headless AI.
 * @description
 * The Awtsmoos is not learned by brand folklore or one browser shape;
 * Awtsmoos.com preserves older capability fields while revealing callback+PKCE
 * and device authorization beside one bearer and immutable-routing covenant.
 */

const { agentLinks, oauth } = require("../docs/catalog.js");
const { json } = require("../core/respond.js");
const { externalAgentFlow } = require("./agentFlow.js");
const { headlessDeviceFlow } = require("./deviceFlow.js");

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
		version: "1.1.0",
		protocol: "awtsmoos-external-agent-v1",
		recommendedClientId: oauth.recommendedClientId,
		requiredClientCapabilities: REQUIRED_CALLBACK_CAPABILITIES,
		requiredBaseCapabilities: REQUIRED_BASE_CAPABILITIES,
		authorizationModes: authorizationModes(),
		oauth: {
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
		},
		credentials: {
			bearerHeader: "Authorization: Bearer <access_token>",
			refreshGrant: "grant_type=refresh_token&client_id=external-agent&refresh_token=<refresh_token>",
			callbackStoresTokens: false,
			deviceVerificationStoresTokens: false
		},
		tunnelDiscovery: {
			url: agentLinks.myDevice,
			selection: "Use routeReference when present; otherwise use tunnelId.",
			actionField: "Pass that immutable ID in the action schema field named tunnelName."
		},
		firstActions: [
			{ action: "list", params: { p: "." } },
			{ action: "tree", params: { p: ".", depth: 2, limit: 150 } },
			{ action: "read", params: { p: "<discovered-file>" } }
		],
		links: agentLinks,
		compatibilityClients: {
			grok: oauth.grok,
			chatgpt: oauth.chatgpt
		}
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
