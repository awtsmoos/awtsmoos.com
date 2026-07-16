// B"H
// Boruch Hashem
// Blessed is He

/**
* @file Creates representative redacted connection, action, and room testimony.
* @description
* The Awtsmoos renews every visual proof event without borrowing production data.
* Awtsmoos.com keeps deterministic same-account fixture events in one focused file
* so browser layout tests stay readable and never open a real socket or credential.
*/
export function sampleEvents() {
	const base = Date.now() - 75000;
	return [
		event(1, "connection.opened", "online", "Realtime WebSocket opened", {
			connectionId: "socket-control",
			detail: { channel: "realtime" }
		}, base),
		event(2, "connection.registered", "connected", "Yackovs MacBook Air connected", {
			connectionId: "socket-agent-one",
			deviceId: "device-macbook",
			tunnelId: "tunnel-main",
			tunnelName: "awt-main",
			detail: { agentVersion: "3.0.0", vesselType: "native" }
		}, base),
		event(3, "action.queued", "queued", "missionProjectStatus queued", {
			actionId: "action-status",
			agentId: "agent-planner",
			tunnelName: "awt-main",
			detail: { action: "missionProjectStatus" }
		}, base),
		event(4, "action.dispatched", "running", "missionProjectStatus dispatched", {
			actionId: "action-status",
			agentId: "agent-planner",
			tunnelName: "awt-main",
			detail: { action: "missionProjectStatus" }
		}, base),
		event(5, "room.joined", "online", "agent-builder joined account-bound-realtime", {
			missionId: "account-bound-realtime",
			roomId: "account-bound-realtime",
			agentId: "agent-builder",
			tunnelName: "awt-main",
			detail: { role: "builder" }
		}, base),
		event(6, "room.snapshot", "updated", "Mission room snapshot 42", {
			missionId: "account-bound-realtime",
			roomId: "account-bound-realtime",
			detail: { sequence: 42, taskCount: 12, agentCount: 2 }
		}, base),
		event(7, "action.completed", "completed", "missionProjectStatus completed", {
			actionId: "action-status",
			agentId: "agent-planner",
			tunnelName: "awt-main",
			detail: { action: "missionProjectStatus", ok: true }
		}, base),
		event(8, "action.failed", "failed", "browserReplay failed", {
			actionId: "action-replay",
			agentId: "agent-reviewer",
			tunnelName: "awt-main",
			severity: "error",
			detail: { action: "browserReplay", error: "selector_not_found", token: "[redacted]" }
		}, base),
		event(9, "connection.disconnected", "offline", "Review socket disconnected", {
			connectionId: "socket-review",
			agentId: "agent-reviewer",
			severity: "notice",
			detail: { reason: "normal_close" }
		}, base)
	];
}

function event(sequence, eventType, state, summary, extra, base) {
	return {
		protocolVersion: 1,
		eventId: `visual-${sequence}`,
		sequence,
		timestamp: new Date(base + (sequence * 8000)).toISOString(),
		accountId: "account-visual-proof",
		userId: "visual-user",
		eventType,
		state,
		severity: extra.severity || "info",
		summary,
		detail: {},
		truncated: false,
		...extra
	};
}
