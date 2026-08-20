// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Code browser-tunnel runtime state separated from remembered consent.
 * @description
 * The Awtsmoos lets one Code tab live now while another intention may be remembered
 * for a future opening. Awtsmoos.com migrates both the dedicated legacy tunnel record
 * and an older settings snapshot, yet always renews socket/error/runtime fields as
 * disabled at page load. Memory may endure; present authority is created anew.
 */

import { State } from "../state.js";
import {
	normalizePeerConsent,
	runtimeConsentMode
} from "../../../../shared/tunnel/peerConsent.js";

export const CODE_BROWSER_TUNNEL_STORAGE_KEY = "awtsmoos_code_browser_tunnel";

export function initializeBrowserTunnelState() {
	const stored = readStored();
	const current = State.browserTunnel || {};
	const source = hasConsentSignal(stored) ? stored.consent || stored : current;
	const consent = normalizePeerConsent(source);
	State.browserTunnel = {
		...current,
		enabled: false,
		autoStart: consent.remembered,
		remembered: consent.remembered,
		consentMode: "disabled",
		status: "idle",
		tunnelName: stored.tunnelName || current.tunnelName || defaultTunnelName(),
		relayUrl: stored.relayUrl || current.relayUrl || defaultRelayUrl(),
		reconnectAttempt: 0,
		connectedAt: null,
		lastError: ""
	};
	State.browserTunnel.consentMode = runtimeConsentMode({
		enabled: false,
		remembered: consent.remembered
	});
	return State.browserTunnel;
}

export function setBrowserTunnelRemembered(remembered) {
	const tunnel = State.browserTunnel || initializeBrowserTunnelState();
	tunnel.remembered = remembered === true;
	tunnel.autoStart = tunnel.remembered;
	if (tunnel.enabled) {
		tunnel.consentMode = runtimeConsentMode({
			enabled: true,
			remembered: tunnel.remembered
		});
	}
	return persistBrowserTunnelState();
}

export function persistBrowserTunnelState() {
	const tunnel = State.browserTunnel || {};
	const stable = {
		consent: normalizePeerConsent({ remembered: tunnel.remembered === true }),
		autoStart: tunnel.remembered === true,
		tunnelName: tunnel.tunnelName || defaultTunnelName(),
		relayUrl: tunnel.relayUrl || defaultRelayUrl()
	};
	localStorage.setItem(CODE_BROWSER_TUNNEL_STORAGE_KEY, JSON.stringify(stable));
	return stable;
}

export function defaultTunnelName() {
	const stored = localStorage.getItem("awtsmoos_code_tunnel_name");
	if (stored) return stored;
	const name = `awt-code-${Math.random().toString(36).slice(2, 8)}`;
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
	url.protocol = url.protocol === "https:"
		? "wss:"
		: url.protocol === "http:" ? "ws:" : url.protocol;
	url.pathname = "/ws";
	url.search = "";
	url.hash = "";
	return url.toString();
}

function hasConsentSignal(value = {}) {
	return Boolean(value.consent) ||
		value.autoStart !== undefined ||
		value.remembered !== undefined ||
		value.enabled !== undefined;
}

function readStored() {
	try {
		return JSON.parse(localStorage.getItem(CODE_BROWSER_TUNNEL_STORAGE_KEY) || "{}") || {};
	} catch {
		return {};
	}
}
