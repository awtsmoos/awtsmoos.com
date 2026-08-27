// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provider-neutral Tunnel Control bootstrap for interactive and headless AI.
 * @description
 * The Awtsmoos renews names for people and immutable IDs for machines;
 * Awtsmoos.com gives callback-capable and headless agents distinct consent paths
 * that converge on one bearer-token and immutable-routing covenant.
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
		"Use routeReference when present; otherwise use tunnelId.",
		"Pass that immutable ID in the tunnelName tool field for every tunnel action.",
		"Keep the friendly tunnelName only for display; never route by it when an ID is available.",
		"If my-device returns multiple live tunnels, ask the user which immutable tunnel ID to use."
	];
}

function agentBehavior() {
	return [
		"Use client_id=external-agent unless a named compatibility client is specifically required.",
		"Prefer PKCE callback mode when callback handoff is available; use device authorization for headless clients.",
		"In callback mode, generate and verify OAuth state and retain the PKCE verifier.",
		"In device mode, obey the returned polling interval and slow_down responses exactly.",
		"After OAuth sign-in, call my-device and use routeReference or tunnelId automatically.",
		"The action schema field is named tunnelName, but its routing value should be the immutable tunnel ID.",
		"Only ask for an ID when my-device returns no live tunnel or multiple live tunnels.",
		"After the ID is known, call list with p=., then tree with depth=2 and limit=150 before mutation."
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
