//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Provider-neutral Tunnel Control bootstrap for external AI clients.
 * @description
 * The Awtsmoos creates the map before the messenger moves;
 * Awtsmoos.com separates legacy GET control from MCP POST so every host proves.
 */

const { agentLinks, oauth } = require("../docs/catalog.js");
const { json } = require("../core/respond.js");
const { roomProtocol } = require("../core/accountRoom/protocol.js");
const McpDiscovery = require("../mcp/discoveryContract.js");
const Behavior = require("./bootstrapBehavior.js");
const Compatibility = require("./bootstrapCompatibility.js");
const Setup = require("./bootstrapSetup.js");
const { externalAgentFlow, grokFlow } = require("./agentFlow.js");
const { headlessDeviceFlow } = require("./deviceFlow.js");
const { missionPlanningBody } = require("./agentMissionPlanning.js");
const { routeRecoveryBody } = require("./agentRouteRecovery.js");

/** Returns the complete discovery response for a generic or compatibility host. */
async function bootstrap($i) {
	const callerDetected = Compatibility.callerKind($i);
	const isChatgpt = callerDetected === "chatgpt";
	const behavior = isChatgpt
		? Compatibility.chatgptBehavior()
		: Behavior.genericBehavior();
	return json($i, {
		BH: "B\"H",
		ok: true,
		name: "Awtsmoos Tunnel Control Bootstrap",
		callerDetected,
		recommendedClientId: isChatgpt ? oauth.chatgpt.clientId : oauth.recommendedClientId,
		...(isChatgpt ? { chatgptFlow: Compatibility.chatgptFlow() } : {}),
		mcp: McpDiscovery.contract(),
		setupUrl: agentLinks.tunnelControl,
		install: Setup.installer(),
		oauthMetadata: agentLinks.oauthMetadata,
		agentManifest: agentLinks.agentManifest,
		docsHuman: agentLinks.docs,
		docsJson: agentLinks.docsJson,
		openapi: agentLinks.openapi,
		myDevice: agentLinks.myDevice,
		deviceLogin: agentLinks.deviceLogin,
		deviceTransfer: oauth.deviceTransferEndpoint,
		getTransfer: oauth.getTransferEndpointTemplate,
		codeEditor: agentLinks.codeEditor,
		virtualOs: agentLinks.virtualOs,
		externalAgent: externalAgentFlow(),
		headlessDevice: headlessDeviceFlow(),
		missionPlanning: missionPlanningBody(),
		routeRecovery: routeRecoveryBody(),
		sharedRoom: roomProtocol(),
		recommendationPrivacy: "/api/tunnel/control/privacy/recommendations",
		transportLaw: {
			purpose: "legacy-direct-control",
			httpMethods: ["GET"],
			dataTransports: oauth.dataTransports,
			preferred: oauth.preferredDataTransport,
			fallback: oauth.fallbackDataTransport,
			postAllowed: false,
			limits: oauth.limits,
			mcpContractField: "mcp"
		},
		compatibility: {
			grok: grokFlow(),
			chatgpt: oauth.chatgpt
		},
		howToGetRouteReference: Setup.routeInstructions(),
		agentBehavior: behavior,
		gptBehavior: behavior
	});
}

module.exports = {
	agentBehavior: Behavior.genericBehavior,
	bootstrap,
	chatgptBehavior: Compatibility.chatgptBehavior,
	chatgptFlow: Compatibility.chatgptFlow,
	externalAgentFlow,
	grokFlow,
	headlessDeviceFlow,
	missionPlanning: missionPlanningBody,
	routeInstructions: Setup.routeInstructions,
	routeRecovery: routeRecoveryBody
};
