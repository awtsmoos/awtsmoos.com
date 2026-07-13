// B"H
// Boruch Hashem
// Blessed is He

import { normalizeTunnelPresence } from "../../../../shared/tunnel/presenceStates.js";

/**
 * The Awtsmoos carries Apps Code browser-tunnel facts into the shared
 * Awtsmoos.com presence language without importing browser state into tests.
 */

/**
 * Reads normalized Apps Code tunnel presence.
 *
 * @param {object} tunnelState Raw browser tunnel state.
 * @returns {object} Canonical presence with vessel identity.
 */
export function readCodeTunnelPresence(tunnelState = {}) {
	const presence = normalizeTunnelPresence({
		enabled: resolveEnabled(tunnelState),
		connected: tunnelState.status === "connected",
		state: tunnelState.status,
		readyState: tunnelState.socket?.readyState,
		reconnectAttempt: tunnelState.reconnectAttempt,
		error: tunnelState.lastError
	});
	return Object.freeze({
		...presence,
		name: tunnelState.settings?.name || tunnelState.name || "Apps Code",
		vesselType: "browser-tunnel"
	});
}

/** @param {object} presence Canonical presence. @returns {string} Status text. */
export function formatCodeTunnelPresence(presence) {
	return `Tunnel: ${presence.label}`;
}

/**
 * Binds event-driven and bounded periodic presence refresh.
 *
 * @param {Function} refresh Refresh callback.
 * @param {object} options Binding options.
 * @returns {Function} Cleanup callback.
 */
export function bindCodeTunnelPresence(refresh, options = {}) {
	const windowObject = options.windowObject || globalThis.window;
	const intervalMs = options.intervalMs || 1000;
	windowObject?.addEventListener?.("awtsmoos:code-tab-tunnel", refresh);
	const timer = typeof globalThis.setInterval === "function"
		? globalThis.setInterval(refresh, intervalMs)
		: null;
	return function unbindCodeTunnelPresence() {
		windowObject?.removeEventListener?.("awtsmoos:code-tab-tunnel", refresh);
		if (timer) {
			globalThis.clearInterval(timer);
		}
	};
}

function resolveEnabled(tunnelState) {
	if (typeof tunnelState.enabled === "boolean") {
		return tunnelState.enabled;
	}
	if (tunnelState.status === "idle" && !tunnelState.socket) {
		return false;
	}
	return true;
}
