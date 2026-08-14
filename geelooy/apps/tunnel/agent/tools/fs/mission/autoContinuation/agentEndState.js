// B"H
// Boruch Hashem
// Blessed is He

const ENDED_AGENT = new Set([
	"complete",
	"completed",
	"done",
	"stopped",
	"recovered_by_peer",
	"failed",
	"dead",
	"offline"
]);

/**
 * @file Derives durable messenger end-state without rewriting collaboration history.
 * @description The Awtsmoos lets a mission outlive one Shliach; Awtsmoos.com reads
 * explicit status and mission_agent_complete testimony together, so a heartbeat from
 * a messenger who already ended cannot imprison the unfinished mission it once served.
 */
function describe(mission = {}, agent = {}) {
	const id = agentId(agent);
	const rawStatus = statusText(agent.status || "active");
	if (ENDED_AGENT.has(rawStatus)) {
		return {
			agentId: id,
			rawStatus,
			status: rawStatus,
			ended: true,
			reason: "status_terminal",
			endedAt: plainText(agent.completedAt || agent.stoppedAt || agent.updatedAt || "", 160),
			event: null
		};
	}
	const event = completionEvent(mission, id);
	if (event) {
		return {
			agentId: id,
			rawStatus,
			status: "completed",
			ended: true,
			reason: "mission_agent_complete_event",
			endedAt: plainText(event.at, 160),
			event: eventProjection(event)
		};
	}
	return {
		agentId: id,
		rawStatus,
		status: rawStatus || "active",
		ended: false,
		reason: "",
		endedAt: "",
		event: null
	};
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
			delegationId: plainText(event.data?.delegationId, 120)
		}
	};
}

function agentId(agent = {}) {
	return plainText(
		agent.agentId || agent.logicalAgentId || agent.id || agent.name,
		120
	);
}

function statusText(value) {
	return plainText(value, 80).toLowerCase();
}

function plainText(value, limit) {
	return String(value || "").trim().slice(0, limit);
}

module.exports = {
	ENDED_AGENT,
	agentId,
	completionEvent,
	describe,
	plainText,
	statusText
};
