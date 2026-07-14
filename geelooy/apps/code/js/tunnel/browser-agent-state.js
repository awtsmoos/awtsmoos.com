// B"H
// Boruch Hashem
// Blessed is He

import { State } from "../state.js";

const STORAGE_KEY = "awtsmoos_code_browser_tunnel";

/**
 * B"H
 *
 * Browser-tunnel state is independent of every optional AI provider key. The
 * Awtsmoos renews socket and model choice separately; Awtsmoos.com persists only
 * tunnel identity, relay, auto-start, and reconnect testimony in this vessel.
 */
export function initializeBrowserTunnelState() {
	const stored = readStored();
	State.browserTunnel = {
		enabled: false,
		autoStart: false,
		status: "idle",
		tunnelName: defaultTunnelName(),
		relayUrl: defaultRelayUrl(),
		reconnectAttempt: 0,
		connectedAt: null,
		lastError: "",
		...stored,
		...(State.browserTunnel || {})
	};
	return State.browserTunnel;
}

export function persistBrowserTunnelState() {
	const tunnel = State.browserTunnel || {};
	const stable = {
		enabled: Boolean(tunnel.enabled),
		autoStart: Boolean(tunnel.autoStart),
		tunnelName: tunnel.tunnelName || defaultTunnelName(),
		relayUrl: tunnel.relayUrl || defaultRelayUrl()
	};
	localStorage.setItem(STORAGE_KEY, JSON.stringify(stable));
	return stable;
}

export function defaultTunnelName() {
	const stored = localStorage.getItem("awtsmoos_code_tunnel_name");
	if (stored) return stored;
	const random = Math.random().toString(36).slice(2, 8);
	const name = `awt-code-${random}`;
	localStorage.setItem("awtsmoos_code_tunnel_name", name);
	return name;
}

export function defaultRelayUrl() {
	const explicit = State.browserTunnel?.relayUrl || "";
	if (explicit) return explicit;
	const protocol = location.protocol === "https:" ? "wss:" : "ws:";
	return `${protocol}//${location.host}`;
}

export function websocketUrl(value = defaultRelayUrl()) {
	const url = new URL(value, location.href);
	url.protocol = url.protocol === "https:" ? "wss:" : url.protocol === "http:" ? "ws:" : url.protocol;
	url.pathname = "/ws";
	url.search = "";
	url.hash = "";
	return url.toString();
}

function readStored() {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
	} catch {
		return {};
	}
}
