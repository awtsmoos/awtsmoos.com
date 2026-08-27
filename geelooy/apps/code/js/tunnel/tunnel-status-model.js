// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Pure Code tunnel status model with explicit consent truth.
 * @description
 * The Awtsmoos lets transport, registration, agents, browser targets, and remembered
 * intent appear together without becoming one thing. Awtsmoos.com shows whether this
 * runtime is enabled, whether future Code opens may reconnect, and what consent mode
 * governs the present tab while keeping provider and DOM concerns outside the model.
 */

import { consentLabel, PeerConsentMode } from "../../../../shared/tunnel/peerConsent.js";

export function buildTunnelStatusModel(options = {}) {
	const tunnel = options.tunnel || {};
	const sessions = Array.isArray(options.sessions) ? options.sessions : [];
	const actions = Array.isArray(options.actions) ? options.actions : [];
	const browserTarget = options.browserTarget || null;
	const activeSessions = sessions.filter(session => Number(session.activeRequests || 0) > 0);
	const consentMode = tunnel.consentMode || PeerConsentMode.DISABLED;
	return {
		status: tunnel.status || "idle",
		enabled: tunnel.enabled === true,
		connected: tunnel.status === "connected",
		remembered: tunnel.remembered === true,
		sessionEnabled: tunnel.enabled === true && consentMode === PeerConsentMode.SESSION,
		consentMode,
		consentLabel: consentLabel(consentMode),
		tunnelName: tunnel.tunnelName || "",
		connectedAt: tunnel.connectedAt || null,
		lastError: tunnel.lastError || "",
		reconnectAttempt: Number(tunnel.reconnectAttempt || 0),
		agentCount: sessions.length,
		activeAgentCount: activeSessions.length,
		sessions: sessions.slice(0, 24),
		actions: actions.slice(0, 180),
		missions: missionSummaries(sessions),
		browserTarget,
		runtime: options.runtime || null,
		updatedAt: new Date().toISOString()
	};
}

export function missionSummaries(sessions = []) {
	const missions = new Map();
	for (const session of sessions) {
		const key = session.missionId || session.roomId || "unassigned";
		const current = missions.get(key) || {
			missionId: session.missionId || "",
			roomId: session.roomId || "",
			title: session.missionTitle || "Unassigned mission",
			agentCount: 0,
			activeRequests: 0,
			lastSeenAt: session.lastSeenAt
		};
		current.agentCount += 1;
		current.activeRequests += Number(session.activeRequests || 0);
		if (Date.parse(session.lastSeenAt) > Date.parse(current.lastSeenAt)) {
			current.lastSeenAt = session.lastSeenAt;
		}
		missions.set(key, current);
	}
	return [...missions.values()]
		.sort((left, right) => Date.parse(right.lastSeenAt) - Date.parse(left.lastSeenAt));
}
