// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provider-neutral Tunnel Control bootstrap for interactive and headless AI.
 * @description
 * The Awtsmoos renews names, routes, and insurance without forcing the human to
 * arbitrate ordinary redundancy. Awtsmoos.com teaches one automatic route covenant,
 * durable receipt custody, and safe recovery before any agent begins to act.
 */

const { agentLinks, oauth } = require("../docs/catalog.js");
const { json } = require("../core/respond.js");
const {
	externalAgentFlow,
	grokFlow
} = require("./agentFlow.js");
const { headlessDeviceFlow } = require("./deviceFlow.js");

function installer() {
	return {
		windows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
		macLinux: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
		restartRule: "Run the same installer command again; it refreshes the agent, preserves its saved identity, and starts it."
	};
}

function routeInstructions() {
	return [
		"Authenticate, then call /api/tunnel/control/my-device.",
		"Use selectedRoute.routeReference automatically when present; otherwise use the returned top-level routeReference or tunnelId.",
		"Treat insuranceRoutes as warm recovery routes. Never ask the user to choose primary versus recovery when humanChoiceRequired is false.",
		"Ask the user about device selection only when my-device explicitly returns humanChoiceRequired=true for genuinely different live devices or surfaces.",
		"After route failure, call my-device again and follow its new selectedRoute instead of remembering a prior tunnel name.",
		"Before carrying cwd or relative paths onto an insurance route, rediscover that route's project root/capabilities; never concatenate a prior route's absolute root.",
		"If a mutation has already been accepted, observe its receipt/job status first. Do not replay it on insurance unless the receipt explicitly proves safeToReplay=true."
	];
}

function agentBehavior() {
	return [
		"Use client_id=external-agent unless a named compatibility client is specifically required.",
		"Prefer PKCE callback mode when callback handoff is available; use device authorization for headless clients.",
		"After OAuth sign-in, call my-device and consume its automatic selectedRoute and insuranceRoutes contract.",
		"The public action field is a compact capability; pass the exact inward deed in operation.",
		"Discover curated operation examples in /api/tunnel/control/agent-manifest.",
		"Start with action=files operation=list p=., then action=files operation=tree depth=2 limit=150 on the selected route.",
		"Use collaboration missions, claims, heartbeats, and handoffs when many agents share one workspace.",
		"Observe accepted receipts before failover replay so route recovery cannot duplicate side effects.",
		"For ordinary website publication use action=web operation=publishWebsite with an owned alias folder path.",
		"Only return a publication URL after its receipt says canonicalVerifiedLive=true."
	];
}

async function bootstrap($i) {
	const behavior = agentBehavior();
	return json($i, {
		BH: "B\"H",
		ok: true,
		name: "Awtsmoos Tunnel Control Bootstrap",
		recommendedClientId: oauth.recommendedClientId,
		setupUrl: agentLinks.tunnelControl,
		controlPanelUrl: agentLinks.tunnelControl,
		install: installer(),
		oauthMetadata: agentLinks.oauthMetadata,
		agentManifest: agentLinks.agentManifest,
		deviceLogin: oauth.deviceVerificationUri,
		docsHuman: agentLinks.docs,
		docsJson: agentLinks.docsJson,
		openapi: agentLinks.openapi,
		myDevice: agentLinks.myDevice,
		codeEditor: agentLinks.codeEditor,
		virtualOs: agentLinks.virtualOs,
		privacyPolicy: "https://awtsmoos.com/apps/tunnel-control/privacy.html",
		externalAgent: externalAgentFlow(),
		headlessDevice: headlessDeviceFlow(),
		compatibility: {
			grok: grokFlow(),
			chatgpt: oauth.chatgpt
		},
		grok: grokFlow(),
		howToGetRouteReference: routeInstructions(),
		agentBehavior: behavior,
		gptBehavior: behavior,
		firstUserPrompt: "Are you installing Awtsmoos Tunnel for the first time, or is it already installed and you just need to start it?"
	});
}

module.exports = {
	agentBehavior,
	bootstrap,
	externalAgentFlow,
	grokFlow,
	headlessDeviceFlow,
	routeInstructions
};
