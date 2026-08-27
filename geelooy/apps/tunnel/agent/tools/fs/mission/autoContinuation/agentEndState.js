// B"H
// Boruch Hashem
// Blessed is He

const LIFECYCLES = Object.freeze({
	COMPLETED: "completed",
	COMPLETED_REMAINING: "completed_with_remaining_work",
	FAILED: "failed",
	DISCONNECTED: "disconnected",
	STALE: "stale",
	CANCELLED: "cancelled",
	SUPERSEDED: "superseded",
	ABANDONED: "abandoned",
	ACTIVE: "active"
});

const STATUS_GROUPS = Object.freeze({
	[LIFECYCLES.COMPLETED]: new Set(["complete", "completed", "done"]),
	[LIFECYCLES.FAILED]: new Set(["failed", "dead", "error", "crashed"]),
	[LIFECYCLES.DISCONNECTED]: new Set(["offline", "disconnected", "connection_lost"]),
	[LIFECYCLES.STALE]: new Set(["stale", "expired", "unresponsive"]),
	[LIFECYCLES.CANCELLED]: new Set(["cancelled", "canceled"]),
	[LIFECYCLES.SUPERSEDED]: new Set(["superseded", "recovered_by_peer"]),
	[LIFECYCLES.ABANDONED]: new Set(["stopped", "abandoned"])
});

const ENDED_AGENT = new Set(
	Object.values(STATUS_GROUPS).flatMap(values => [...values])
);

/**
 * @file Distinguishes intentional completion from failure, disconnection, staleness, and abandonment.
 * @description
 * The Awtsmoos renews every messenger, yet an ended voice may leave for very different
 * reasons. Awtsmoos.com refuses to call silence success: only explicit completion
 * testimony is intentional, while crashes, stale pulses, and abandoned work remain recoverable truth.
 */
function describe(mission = {}, agent = {}) {
	const id = agentId(agent);
	const rawStatus = statusText(agent.status || "active");
	const completion = completionEvent(mission, id);
	if (completion) {
		return terminal(id, rawStatus, LIFECYCLES.COMPLETED, true, {
			reason: "mission_agent_complete_event",
			endedAt: plainText(completion.at, 160),
			event: eventProjection(completion)
		});
	}
	const lifecycle = lifecycleForStatus(rawStatus);
	if (lifecycle === LIFECYCLES.ACTIVE) {
		return {
			agentId: id,
			rawStatus,
			status: rawStatus || "active",
			lifecycle,
			ended: false,
			intentional: false,
			reason: "",
			endedAt: "",
			event: null
		};
	}
	return terminal(id, rawStatus, lifecycle, lifecycle === LIFECYCLES.COMPLETED, {
		reason: `status_${lifecycle}`,
		endedAt: endedAt(agent),
		event: null
	});
}

function terminal(id, rawStatus, lifecycle, intentional, details) {
	return {
		agentId: id,
		rawStatus,
		status: lifecycle,
		lifecycle,
		ended: true,
		intentional,
		...details
	};
}

function lifecycleForStatus(status) {
	for (const [lifecycle, values] of Object.entries(STATUS_GROUPS)) {
		if (values.has(status)) return lifecycle;
	}
	return LIFECYCLES.ACTIVE;
}

function completionEvent(mission = {}, id = "") {
	if (!id) return null;
	const events = Array.isArray(mission.events) ? mission.events : [];
	for (let index = events.length - 1; index >= 0; index -= 1) {
		const event = events[index] || {};
		if (event.type !== "mission_agent_complete") continue;
		if (plainText(event.data?.agentId, 120) === id) return event;
	}
	return null;
}

function eventProjection(event = {}) {
	return {
		at: plainText(event.at, 160),
		type: plainText(event.type, 120),
		msg: plainText(event.msg || event.message, 240),
		data: {
			agentId: plainText(event.data?.agentId, 120),
			claimId: plainText(event.data?.claimId, 120),
			delegationId: plainText(event.data?.delegationId, 120),
			spawnGroupId: plainText(event.data?.spawnGroupId, 120),
			generation: Number(event.data?.generation || 0) || null
		}
	};
}

function endedAt(agent = {}) {
	return plainText(
		agent.completedAt || agent.failedAt || agent.disconnectedAt || agent.staleAt ||
		agent.cancelledAt || agent.stoppedAt || agent.updatedAt || "",
		160
	);
}

function agentId(agent = {}) {
	return plainText(agent.agentId || agent.logicalAgentId || agent.id || agent.name, 120);
}

function statusText(value) {
	return plainText(value, 80).toLowerCase();
}

function plainText(value, limit) {
	return String(value || "").trim().slice(0, limit);
}

module.exports = {
	ENDED_AGENT,
	LIFECYCLES,
	STATUS_GROUPS,
	agentId,
	completionEvent,
	describe,
	lifecycleForStatus,
	plainText,
	statusText
};
