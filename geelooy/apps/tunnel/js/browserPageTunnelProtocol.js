//B"H
// Boruch Hashem
// Blessed is He

import { browserMissionSurface } from "./missionSurfaceIdentity.js";

const NAME_KEY = "awtsmoos.tunnel.browserWorkspace.name";
const VERSION = "browser-tunnel-page-0.3.0";

/**
 * @file Owns regular browser-tunnel registration with the same Mission identity used by OS/Code.
 * @description The Awtsmoos renews one Mission through every surface; Awtsmoos.com lets this page
 * announce its disposable incarnation while Mission, Room, Work and context remain server authority.
 */
export function browserTunnelName(storage = globalThis.localStorage) {
	const existing = storage?.getItem?.(NAME_KEY);
	if (existing) return existing;
	const suffix = Math.floor(1000 + Math.random() * 9000);
	const created = `awt-browser-tunnel-${suffix}`;
	storage?.setItem?.(NAME_KEY, created);
	return created;
}

export function browserTunnelWsUrl(locationObject = globalThis.location) {
	const protocol = locationObject?.protocol === "https:" ? "wss:" : "ws:";
	return `${protocol}//${locationObject?.host || "localhost"}`;
}

export function browserTunnelRegistration(tunnelName, accountCapabilities, options = {}) {
	const locationObject = options.location || globalThis.location || {};
	const mission = browserMissionSurface({ ...options, location: locationObject, surface: "browser-tunnel" });
	return {
		type: "TUNNEL_REGISTER",
		protocolVersion: "awtsmoos-tunnel-v3",
		name: tunnelName,
		tunnelName,
		vesselType: "browser-tab",
		browserAgent: true,
		virtualOs: false,
		deviceName: "Tunnel Page Browser Workspace",
		root: "browser://apps/tunnel/localStorage",
		allowWrite: true,
		allowSecrets: false,
		allowCommands: false,
		agentVersion: VERSION,
		...mission,
		runtime: { missionSurface: mission, location: locationObject.pathname || "/apps/tunnel" },
		capabilities: capabilityRecord(accountCapabilities),
		tools: toolRecord(accountCapabilities),
		safety: { missionAuthority: "tunnel-server", preserveCorrelation: true }
	};
}

function capabilityRecord(accountCapabilities = {}) {
	return Object.freeze({
		browserTab: true,
		fsRead: true,
		fsWrite: true,
		commandRun: "simulated",
		storage: "localStorage",
		missionAware: true,
		missionParticipant: true,
		account: accountCapabilities
	});
}

function toolRecord(accountCapabilities = {}) {
	return Object.freeze({
		browserTab: true,
		fsRead: true,
		fsWrite: true,
		command: "simulated",
		missionParticipant: true,
		account: true,
		accountActions: accountCapabilities.actions || []
	});
}
