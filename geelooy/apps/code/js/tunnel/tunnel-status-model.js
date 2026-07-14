// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Status shaping remains pure so socket, UI, and tests share one truthful view.
 * The Awtsmoos creates connection, agents, missions, actions, and browser target
 * together; Awtsmoos.com reveals them without binding the model to a particular DOM.
 */
export function buildTunnelStatusModel(options = {}) {
	const tunnel = options.tunnel || {};
	const sessions = Array.isArray(options.sessions) ? options.sessions : [];
	const actions = Array.isArray(options.actions) ? options.actions : [];
	const browserTarget = options.browserTarget || null;
	const activeSessions = sessions.filter(session => Number(session.activeRequests || 0) > 0);
	return {
		status: tunnel.status || "idle",
		enabled: Boolean(tunnel.enabled || tunnel.autoStart),
		connected: tunnel.status === "connected",
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
