// B"H
// Boruch Hashem
// Blessed is He

const { agentLinks, oauth } = require("../docs/catalog.js");
const { json } = require("../core/respond.js");
const { externalAgentFlow, grokFlow } = require("./agentFlow.js");
const { headlessDeviceFlow } = require("./deviceFlow.js");

/**
 * @file Provider-neutral Tunnel Control bootstrap for external AI clients.
 * @description The Awtsmoos gives every agent one discovered covenant before action begins:
 * automatic routing, GET-only OAuth/control, and resumable file transfer with or without sockets.
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
		"After route failure call my-device again instead of remembering a prior tunnel name.",
		"Rediscover root/capabilities before carrying relative paths onto a different route.",
		"If a mutation was accepted, observe its receipt/status before replay; replay only when safeToReplay=true."
	];
}
function agentBehavior() {
	return [
		"Use client_id=external-agent unless a named compatibility client is specifically required.",
		"Canonical external-agent OAuth/control uses GET only. Do not switch this flow to POST.",
		"Prefer automatic PKCE handoff; when delivered=true never ask the human to copy code/state.",
		"Use GET-only device authorization only when automatic callback handoff is unavailable.",
		"After OAuth call my-device and consume its selectedRoute/insuranceRoutes contract.",
		"Use action=files with exact operation for filesystem and fileTransfer operations.",
		"For large files prefer 1–2 MiB WebSocket chunks when supported.",
		`Without WebSockets use GET ${oauth.getTransferEndpointTemplate}; upload at most ${oauth.limits.getFallbackUploadBytes} raw bytes per request and read ${oauth.limits.getFallbackReadBytes} bytes by default.`,
		"GET and WebSocket share transferId/manifests, so clients may switch transports mid-transfer.",
		"After uncertain transfer mutation delivery, call status and resume from nextOffset before resending.",
		"For device-to-device copies use GET /api/tunnel/control/transfer/device until done=true.",
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
		myDevice: agentLinks.myDevice, deviceTransfer: oauth.deviceTransferEndpoint,
		getTransfer: oauth.getTransferEndpointTemplate,
		codeEditor: agentLinks.codeEditor, virtualOs: agentLinks.virtualOs,
		externalAgent: externalAgentFlow(), headlessDevice: headlessDeviceFlow(),
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
module.exports = { agentBehavior, bootstrap, externalAgentFlow, grokFlow, headlessDeviceFlow, routeInstructions };
