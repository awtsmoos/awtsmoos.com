// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../core/respond.js");

/**
 * @file Teaches agents to route by immutable tunnel ID after account discovery.
 * @description
 * The Awtsmoos renews friendly names for people and stable IDs for machinery.
 * Awtsmoos.com never asks an agent to route by an alias when my-device already
 * returned the authoritative routeReference that survives stale reinstall records.
 */
async function bootstrap($i) {
	return json($i, {
		BH: "B\"H",
		ok: true,
		name: "Awtsmoos Tunnel Control Bootstrap",
		setupUrl: "https://awtsmoos.com/apps/tunnel-control/",
		controlPanelUrl: "https://awtsmoos.com/apps/tunnel-control/",
		installCommandWindows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
		restartCommandWindows: "irm https://awtsmoos.com/api/tunnel/install/windows | iex",
		installCommandMacLinux: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
		restartCommandMacLinux: "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash",
		docsHuman: "https://awtsmoos.com/api/tunnel/control/docs",
		docsJson: "https://awtsmoos.com/api/tunnel/control/docs.json",
		openapi: "https://awtsmoos.com/api/tunnel/control/openapi",
		myDevice: "https://awtsmoos.com/api/tunnel/control/my-device",
		privacyPolicy: "https://awtsmoos.com/apps/tunnel-control/privacy.html",
		modes: modes(),
		howToGetRouteReference: routeInstructions(),
		firstUserPrompt: "Are you installing Awtsmoos Tunnel for the first time, or is it already installed and you just need to start it?",
		gptBehavior: behavior()
	});
}

function modes() {
	return {
		installNew: {
			userSays: ["install", "set up", "I don't have it"],
			response: "Open the setup page and run the installer command for your OS. After it says connected, use my-device to discover the immutable routeReference."
		},
		alreadyInstalled: {
			userSays: ["already installed", "start it", "restart it", "I have it"],
			response: "Run the same installer command again. It refreshes the agent, preserves identity, and starts the tunnel."
		},
		oauthAutoDetect: {
			userSays: ["I'm logged in", "connected", "start"],
			response: "After OAuth sign-in, call my-device and use routeReference or tunnelId, never the friendly tunnelName, for tool routing."
		},
		manualFallback: {
			userSays: ["auto detect failed"],
			response: "Open Tunnel Control and copy the immutable tunnel ID. Friendly names are display labels only."
		}
	};
}

function routeInstructions() {
	return [
		"Sign in with Awtsmoos OAuth, then call /api/tunnel/control/my-device.",
		"Use routeReference when present; otherwise use tunnelId.",
		"Pass that immutable ID in the tunnelName tool field for every tunnel action.",
		"Keep tunnelName only for display. Never route by it when an ID is available.",
		"If one live same-name route exists beside stale records, my-device returns its ID."
	];
}

function behavior() {
	return [
		"Do not hardcode a friendly tunnelName.",
		"After OAuth sign-in, call awtsmoosMyDevice.",
		"Use returned routeReference or tunnelId automatically.",
		"The tunnel action schema calls the field tunnelName, but its value should be the immutable tunnel ID.",
		"Only ask for an ID when my-device returns no live tunnel or multiple live tunnels.",
		"After the ID is known, call list with p=., then tree with depth=2 and limit=150.",
		"Never bulk read the whole app at once."
	];
}

module.exports = { bootstrap };
