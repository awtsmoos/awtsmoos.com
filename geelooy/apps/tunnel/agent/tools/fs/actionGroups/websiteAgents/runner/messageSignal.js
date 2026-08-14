// B"H
const Context = require("./context.js");
const event = Context.reference("event");

/** Applies one already-authorized lifecycle signal to durable website state. */
function apply(current, signal) {
	current.roomRevision += 1;
	const targetName = String(signal.input.toAgent || "all");
	for (const agent of current.agents) {
		if (signal.agentSignal && agent.id === signal.agentId) {
			agent.lastUpdate = String(signal.body).slice(0, 2000);
			if (signal.terminal) completeAgent(agent, signal.input);
			continue;
		}
		if (signal.terminal || !targets(targetName, agent.id)) continue;
		agent.roomDirty = true;
		agent.pendingRoomMessages += 1;
		if (agent.status === "complete") agent.status = "active";
	}
	if (!signal.terminal && !["awaiting_recovery", "cancelled"].includes(current.status)) {
		current.status = "running";
		current.phase = "room_message_queued";
		current.finishedAt = null;
	}
	current.events.push(event("room_message_queued_for_agents", {
		fromAgent: signal.agentId || "control-room-human",
		kind: signal.kind,
		terminal: signal.terminal,
		toAgent: targetName,
		reportId: signal.reportId || undefined,
		roomRevision: current.roomRevision
	}));
	return current;
}

function completeAgent(agent, input) {
	agent.status = "complete";
	agent.roomDirty = false;
	agent.pendingRoomMessages = 0;
	agent.lastOutcome = {
		complete: true,
		status: "COMPLETE",
		reportId: String(input.reportId || "").slice(0, 200) || null,
		next: String(input.next || "").slice(0, 2000),
		files: list(input.files || input.references),
		roomMessage: agent.lastUpdate,
		findings: String(
			input.findings || input.evidence || agent.lastUpdate
		).slice(0, 4000),
		hasStructuredStatus: true
	};
}

function verified(input, body) {
	const explicit = input.complete === true || input.complete === "true";
	return explicit && Boolean(
		String(body || input.evidence || "").trim() || list(input.references).length
	);
}

function hasReport(record, agentId, reportId) {
	return (record.events || []).some(item => {
		return item.reportId === reportId
			&& String(item.fromAgent || "") === String(agentId || "control-room-human");
	});
}

function response(record, roomMessage, terminal, reportId) {
	return {
		ok: true,
		action: "websiteAgentMissionMessage",
		websiteMissionId: record.id,
		missionId: record.missionId,
		reportId: reportId || null,
		duplicate: false,
		delivery: {
			dashboard: "committed",
			websiteAgents: terminal ? "lifecycle_committed" : "next_safe_turn",
			roomRevision: record.roomRevision
		},
		roomMessage,
		missionStatus: record.status
	};
}

function duplicateResponse(record, reportId) {
	return {
		ok: true,
		action: "websiteAgentMissionMessage",
		websiteMissionId: record.id,
		missionId: record.missionId,
		reportId,
		duplicate: true,
		delivery: {
			dashboard: "already_committed",
			websiteAgents: "already_committed",
			roomRevision: record.roomRevision
		},
		missionStatus: record.status
	};
}

function targets(name, agentId) {
	return name === "all" || name === "any_agent" || name === agentId;
}

function list(value) {
	if (Array.isArray(value)) return value.map(String).slice(0, 100);
	return String(value || "").split(/[\n,]+/)
		.map(item => item.trim()).filter(Boolean).slice(0, 100);
}

module.exports = {
	apply,
	duplicateResponse,
	hasReport,
	response,
	verified
};
