// B"H
// Boruch Hashem
// Blessed is He

const { agentLinks, oauth } = require("../docs/catalog.js");
const { json } = require("../core/respond.js");
const { publicationSourceLimits } = require("../../../../sites/hostedFolderManifestLimits.js");
const { externalAgentFlow } = require("./agentFlow.js");
const { headlessDeviceFlow } = require("./deviceFlow.js");
const { missionPlanningBody } = require("./agentMissionPlanning.js");
const { routeRecoveryBody } = require("./agentRouteRecovery.js");
const Operations = require("./agentOperationCatalog.js");

/**
 * @file Machine-readable external-agent covenant for OAuth, routing, recovery, reporting, and transfer.
 * @description The Awtsmoos keeps wounded routes and unfinished deeds visible; Awtsmoos.com teaches
 * agents to recover transiently, file operational reports, and keep recommendation privacy explicit.
 */
const REQUIRED_BASE_CAPABILITIES = Object.freeze([
	"HTTPS GET requests",
	"secure credential storage",
	"Bearer authentication",
	"JSON parsing"
]);
const RECOMMENDED_CAPABILITIES = Object.freeze(["WebSocket tunnel actions"]);
const REQUIRED_CALLBACK_CAPABILITIES = Object.freeze([
	"PKCE S256",
	"browser-assisted authorization",
	"automatic handoff polling",
	...REQUIRED_BASE_CAPABILITIES
]);

function authorizationModes() {
	return {
		callbackPkce: { recommendedWhen: "The AI can retain PKCE/state and poll automatic callback handoff.", flow: externalAgentFlow() },
		headlessDevice: { recommendedWhen: "The AI cannot use callback handoff and needs human verification.", flow: headlessDeviceFlow() }
	};
}
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
function transportLaw() {
	return {
		httpMethods: ["GET"], dataTransports: oauth.dataTransports,
		preferredDataTransport: oauth.preferredDataTransport,
		fallbackDataTransport: oauth.fallbackDataTransport, postAllowed: false
	};
}
function transferBody() {
	return {
		preferred: { transport: "websocket", operations: transferOperations() },
		getFallback: {
			endpointTemplate: oauth.getTransferEndpointTemplate,
			transport: "https-get",
			maxRawUploadBytesPerRequest: oauth.limits.getFallbackUploadBytes,
			defaultReadBytesPerRequest: oauth.limits.getFallbackReadBytes
		},
		deviceBridge: oauth.deviceTransferEndpoint,
		sharedReceipt: "GET and WebSocket share the same transferId and destination manifest; clients may switch transport mid-transfer.",
		postAllowed: false,
		limits: oauth.limits,
		resumeRule: "After uncertain mutation delivery, query status and resume from nextOffset before any replay."
	};
}
function transferOperations() {
	return ["fileTransferSourceInfo", "fileTransferSourceProof", "fileTransferReadChunk", "fileTransferCreate", "fileTransferStatus", "fileTransferWriteChunk", "fileTransferCommit", "fileTransferCancel"];
}
function credentialBody() {
	return { bearerHeader: "Authorization: Bearer <access_token>", refreshGrant: "grant_type=refresh_token&client_id=external-agent&refresh_token=<refresh_token>", callbackStoresTokens: false, deviceVerificationStoresTokens: false };
}
function tunnelDiscovery() {
	return { url: agentLinks.myDevice, selection: "Use routeReference when present; otherwise use tunnelId.", actionField: "Pass that immutable ID in the action schema field named tunnelName." };
}
async function agentManifest($i) { return json($i, manifestBody()); }
module.exports = { agentManifest, authorizationModes, manifestBody, missionPlanningBody, routeRecoveryBody };
