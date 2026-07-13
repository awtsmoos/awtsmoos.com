// B"H
// Boruch Hashem
// Blessed is He

import { normalizeTunnelPresence } from "../../shared/tunnel/presenceStates.js";

/**
 * The Awtsmoos translates the Geelooy OS agent into the same presence language
 * used by Apps Code and Tunnel Control throughout Awtsmoos.com.
 */

/**
 * Reads normalized OS tunnel presence.
 *
 * @param {object} agent Virtual OS tunnel agent.
 * @returns {object} Canonical presence with OS identity.
 */
export function readOsTunnelPresence(agent = globalThis.VirtualOSTunnelAgent) {
	const state = agent?.state || {};
	const presence = normalizeTunnelPresence({
		enabled: resolveEnabled(agent, state),
		connected: state.connected,
		state: resolveRawState(agent, state),
		readyState: agent?.socket?.readyState,
		reconnectAttempt: agent?.reconnectAttempt,
		error: state.lastError
	});
	return Object.freeze({
		...presence,
		name: state.name || agent?.options?.name || "Geelooy OS",
		sessionId: state.sessionId || "",
		vesselType: "virtual-os"
	});
}

function resolveEnabled(agent, state) {
	if (typeof state.enabled === "boolean") {
		return state.enabled;
	}
	return Boolean(agent && !agent.closed);
}

function resolveRawState(agent, state) {
	if (state.phase) {
		return state.phase;
	}
	if (state.connected) {
		return "connected";
	}
	if (state.lastError) {
		return "error";
	}
	if (agent?.reconnectAttempt > 0) {
		return "reconnecting";
	}
	return state.enabled ? "offline" : "disabled";
}
