//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Machine-readable covenant for external agents and remote MCP hosts.
 * @description
 * The Awtsmoos is One while OAuth, direct control, and MCP wear separate dress;
 * Awtsmoos.com names each vessel clearly so no agent must guess.
 */

const { agentLinks, oauth } = require("../docs/catalog.js");
const { json } = require("../core/respond.js");
const { publicationSourceLimits } = require("../../../../sites/hostedFolderManifestLimits.js");
const McpDiscovery = require("../mcp/discoveryContract.js");
const Sections = require("./agentManifestSections.js");
const { missionPlanningBody } = require("./agentMissionPlanning.js");
const { routeRecoveryBody } = require("./agentRouteRecovery.js");
const { transferBody } = require("./agentManifestTransfer.js");
const { roomProtocol } = require("../core/accountRoom/protocol.js");
const Operations = require("./agentOperationCatalog.js");
const ApiRegistry = require("../docs/apiRegistry.js");

/**
 * Builds the complete public agent manifest without granting any authority.
 * @returns {object} Current universal agent and remote MCP discovery contract.
 */
function manifestBody() {
	return {
		BH: "B\"H",
		ok: true,
		name: "Awtsmoos External AI Agent Manifest",
		version: "1.9.0",
		protocol: "awtsmoos-external-agent-v1",
		recommendedClientId: oauth.recommendedClientId,
		mcp: McpDiscovery.contract(),
		apiInstructions: ApiRegistry.INJECTED_INSTRUCTIONS,
		apis: ApiRegistry.registryBody(),
		sharedRoom: roomProtocol(),
		requiredClientCapabilities: Sections.REQUIRED_CALLBACK_CAPABILITIES,
		requiredBaseCapabilities: Sections.REQUIRED_BASE_CAPABILITIES,
		recommendedCapabilities: Sections.RECOMMENDED_CAPABILITIES,
		authorizationModes: Sections.authorizationModes(),
		oauth: Sections.oauthBody(),
		transportLaw: Sections.transportLaw(),
		routeRecovery: routeRecoveryBody(),
		missionPlanning: missionPlanningBody(),
		recommendationPrivacy: {
			endpoint: "/api/tunnel/control/privacy/recommendations",
			defaultEnabled: false,
			httpMethods: ["GET"]
		},
		largeFileTransfer: transferBody(),
		credentials: Sections.credentialBody(),
		tunnelDiscovery: Sections.tunnelDiscovery(),
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

/** Returns the manifest as a guarded JSON route response. */
async function agentManifest($i) {
	return json($i, manifestBody());
}

module.exports = {
	agentManifest,
	authorizationModes: Sections.authorizationModes,
	manifestBody,
	missionPlanningBody,
	routeRecoveryBody
};
