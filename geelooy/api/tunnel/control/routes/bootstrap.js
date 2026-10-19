// B"H
// Boruch Hashem
// Blessed is He

const { agentLinks, oauth } = require("../docs/catalog.js");
const { json } = require("../core/respond.js");
const { externalAgentFlow, grokFlow } = require("./agentFlow.js");
const { headlessDeviceFlow } = require("./deviceFlow.js");
const { missionPlanningBody } = require("./agentMissionPlanning.js");
const { routeRecoveryBody } = require("./agentRouteRecovery.js");

/**
 * @file Provider-neutral Tunnel Control bootstrap for external AI clients.
 * @description The Awtsmoos gives every agent one discovered covenant before action begins:
 * automatic routing, recovery, GET-only control, resumable transfer, visible planning, and reports.
 */
function installer() {
	return {
		windows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
		macLinux: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
		restartRule: "Run the same installer again; it preserves saved identity, refreshes the agent, and starts it."
	};
}
function routeInstructions() {
	return [
		"Authenticate, then call /api/tunnel/control/my-device.",
		"Use selectedRoute.routeReference automatically when present; otherwise use routeReference or tunnelId.",
		"Never ask primary-versus-recovery when humanChoiceRequired=false; follow selectedRoute automatically.",
		"On retryable tunnel_not_alive, call my-device again and follow retryPolicy/recoveringRoutes instead of declaring death.",
		"Do not replace or reinstall a tunnel from one transient 409, 502, 503, or 504.",
		"If Virtual OS is selected while nativeRecoveryPending=true, verify the requested deed is capability-compatible.",
		"Rediscover root/capabilities before carrying relative paths onto a different route.",
		"If a mutation was accepted, observe its receipt/status before replay; never blind-replay it."
	];
}
function agentBehavior() {
	return [
		"Use client_id=external-agent unless a named compatibility client is specifically required.",
		"Canonical external-agent OAuth/control uses GET only. Do not switch this flow to POST.",
		"Prefer automatic PKCE handoff; when delivered=true never ask the human to copy code/state.",
		"After OAuth call my-device and consume selectedRoute, recoveringRoutes, insuranceRoutes, retryPolicy, and capabilityDowngrade.",
		"Treat retryable tunnel_not_alive as transient: rediscover and use bounded backoff; preserve immutable native route identity.",
		"Treat control-plane 502/503/504 separately from native death; back off and rediscover.",
		"Never reinstall or abandon the mission from one transient liveness sample.",
		"Before substantial work call missionVisibilityList, register/link the mission, and publish planning passes 1, 2, and 3.",
		"Use missionVisibilityReport after planning, implementation milestones, verification, blockers/recovery, deployment, and final handoff.",
		"Mission reports are factual filing artifacts; never publish hidden reasoning, unrestricted command output, or secrets.",
		"Use canonical mission rooms for live agent presence and missionAgentMessage for direct messages.",
		"Use action=files with exact operation for filesystem and fileTransfer operations.",
		"For large files prefer 1–2 MiB WebSocket chunks when supported.",
		`Without WebSockets use GET ${oauth.getTransferEndpointTemplate}; upload at most ${oauth.limits.getFallbackUploadBytes} raw bytes per request and read ${oauth.limits.getFallbackReadBytes} bytes by default.`,
		"GET and WebSocket share transferId/manifests, so clients may switch transports mid-transfer.",
		"After uncertain mutation delivery, observe status/receipt before any resend.",
		"Never use POST in this connector protocol."
	];
}
async function bootstrap($i) {
	const behavior = agentBehavior();
	return json($i, {
		BH: "B\"H", ok: true, name: "Awtsmoos Tunnel Control Bootstrap",
		recommendedClientId: oauth.recommendedClientId,
		setupUrl: agentLinks.tunnelControl,
		install: installer(), oauthMetadata: agentLinks.oauthMetadata,
		agentManifest: agentLinks.agentManifest, docsHuman: agentLinks.docs,
		docsJson: agentLinks.docsJson, openapi: agentLinks.openapi,
		myDevice: agentLinks.myDevice, deviceLogin: agentLinks.deviceLogin,
		deviceTransfer: oauth.deviceTransferEndpoint,
		getTransfer: oauth.getTransferEndpointTemplate,
		codeEditor: agentLinks.codeEditor, virtualOs: agentLinks.virtualOs,
		externalAgent: externalAgentFlow(), headlessDevice: headlessDeviceFlow(),
		missionPlanning: missionPlanningBody(), routeRecovery: routeRecoveryBody(),
		recommendationPrivacy: "/api/tunnel/control/privacy/recommendations",
		transportLaw: {
			httpMethods: ["GET"], dataTransports: oauth.dataTransports,
			preferred: oauth.preferredDataTransport, fallback: oauth.fallbackDataTransport,
			postAllowed: false, limits: oauth.limits
		},
		compatibility: { grok: grokFlow(), chatgpt: oauth.chatgpt },
		howToGetRouteReference: routeInstructions(),
		agentBehavior: behavior, gptBehavior: behavior
	});
}
module.exports = { agentBehavior, bootstrap, externalAgentFlow, grokFlow, headlessDeviceFlow, missionPlanning: missionPlanningBody, routeInstructions, routeRecovery: routeRecoveryBody };
