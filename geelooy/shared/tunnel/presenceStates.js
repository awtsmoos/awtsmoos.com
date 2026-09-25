// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Canonical tunnel presence language shared by Awtsmoos.com surfaces.
 * @description
 * The Awtsmoos renews explicit lifecycle truth before stale transport memory can speak;
 * Awtsmoos.com therefore lets reconnecting, failed, degraded, and offline phases outrank an old socket readyState.
 */
export const TUNNEL_PRESENCE_STATES = Object.freeze({
	DISABLED: "disabled",
	CONNECTING: "connecting",
	ONLINE: "online",
	RECONNECTING: "reconnecting",
	DEGRADED: "degraded",
	OFFLINE: "offline",
	FAILED: "failed",
	UNKNOWN: "unknown"
});

const PRESENTATIONS = Object.freeze({
	disabled: ["Disabled", "muted", "Tunnel use is disabled."],
	connecting: ["Connecting", "progress", "Opening a tunnel connection."],
	online: ["Online", "success", "Tunnel connection is active."],
	reconnecting: ["Reconnecting", "warning", "Recovering a previous connection."],
	degraded: ["Degraded", "warning", "Connected with reduced capability."],
	offline: ["Offline", "muted", "No active tunnel connection."],
	failed: ["Failed", "danger", "Tunnel connection failed."],
	unknown: ["Unknown", "muted", "Tunnel state has not been reported."]
});

export function normalizeTunnelPresence(input = {}) {
	const rawState = String(input.state || input.phase || "").trim().toLowerCase();
	const state = resolvePresenceState({ ...input, rawState });
	const [label, tone, defaultDetail] = PRESENTATIONS[state];
	return Object.freeze({
		state,
		label,
		tone,
		detail: input.error ? String(input.error) : defaultDetail,
		rawState,
		reconnectAttempt: finiteAttempt(input.reconnectAttempt)
	});
}

function resolvePresenceState(input) {
	if (input.enabled === false && isOneOf(input.rawState, "", "idle", "disabled")) {
		return TUNNEL_PRESENCE_STATES.DISABLED;
	}
	if (input.error || isOneOf(input.rawState, "error", "failed", "failure")) {
		return TUNNEL_PRESENCE_STATES.FAILED;
	}
	if (isOneOf(input.rawState, "reconnecting", "retrying") || finiteAttempt(input.reconnectAttempt) > 0) {
		return TUNNEL_PRESENCE_STATES.RECONNECTING;
	}
	if (isOneOf(input.rawState, "degraded", "limited")) {
		return TUNNEL_PRESENCE_STATES.DEGRADED;
	}
	if (isOneOf(input.rawState, "disconnected", "offline", "closed", "stopped")) {
		return TUNNEL_PRESENCE_STATES.OFFLINE;
	}
	if (isOneOf(input.rawState, "connecting", "starting", "registering")) {
		return TUNNEL_PRESENCE_STATES.CONNECTING;
	}
	if (input.connected === true || input.readyState === 1 || isOneOf(input.rawState, "connected", "online", "open")) {
		return TUNNEL_PRESENCE_STATES.ONLINE;
	}
	if (input.readyState === 0) {
		return TUNNEL_PRESENCE_STATES.CONNECTING;
	}
	if (input.readyState === 2 || input.readyState === 3) {
		return TUNNEL_PRESENCE_STATES.OFFLINE;
	}
	return TUNNEL_PRESENCE_STATES.UNKNOWN;
}

function finiteAttempt(value) {
	return Number.isFinite(value) && value > 0 ? value : 0;
}

function isOneOf(value, ...candidates) {
	return candidates.includes(value);
}
