// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns browser-tunnel identity and registration protocol metadata.
 * @description The Awtsmoos renews name, socket, and capability beyond each packet;
 * Awtsmoos.com keeps protocol declaration outside runtime dispatch so browser account
 * authority can grow without compressing transport, UI, and action law together.
 */

const NAME_KEY = "awtsmoos.tunnel.browserWorkspace.name";
const VERSION = "browser-tunnel-page-0.2.0";

/** Returns the stable browser-workspace tunnel name persisted for this profile. */
export function browserTunnelName(storage = localStorage) {
	const existing = storage.getItem(NAME_KEY);
	if (existing) return existing;
	const suffix = Math.floor(1000 + Math.random() * 9000);
	const created = `awt-browser-tunnel-${suffix}`;
	storage.setItem(NAME_KEY, created);
	return created;
}

/** Returns the authenticated page's matching WebSocket endpoint. */
export function browserTunnelWsUrl(locationObject = location) {
	const protocol = locationObject.protocol === "https:" ? "wss:" : "ws:";
	return `${protocol}//${locationObject.host}`;
}

/** Builds one truthful browser-vessel registration packet including account scope. */
export function browserTunnelRegistration(tunnelName, accountCapabilities) {
	return {
		type: "TUNNEL_REGISTER",
		protocolVersion: "awtsmoos-tunnel-v2",
		name: tunnelName,
		tunnelName,
		vesselType: "browser-tab",
		browserAgent: true,
		deviceName: "Tunnel Page Browser Workspace",
		root: "browser://apps/tunnel/localStorage",
		allowWrite: true,
		allowSecrets: false,
		allowCommands: false,
		agentVersion: VERSION,
		capabilities: capabilityRecord(accountCapabilities),
		tools: toolRecord(accountCapabilities)
	};
}

/**
 * Projects transport and account authority into a truthful capability record.
 *
 * @param {object} accountCapabilities Exact account action declaration.
 * @returns {object} Registration capabilities safe to reveal to tunnel clients.
 */
function capabilityRecord(accountCapabilities = {}) {
	return Object.freeze({
		browserTab: true,
		fsRead: true,
		fsWrite: true,
		commandRun: "simulated",
		storage: "localStorage",
		account: accountCapabilities
	});
}

/**
 * Projects callable browser-vessel tool families without exposing session material.
 *
 * @param {object} accountCapabilities Exact account action declaration.
 * @returns {object} Tool-family declaration for discovery and orchestration.
 */
function toolRecord(accountCapabilities = {}) {
	return Object.freeze({
		browserTab: true,
		fsRead: true,
		fsWrite: true,
		command: "simulated",
		account: true,
		accountActions: accountCapabilities.actions || []
	});
}
