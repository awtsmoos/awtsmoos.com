// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const event = Context.reference("event");

/**
 * @file Applies explicit website-agent lifecycle signals without confusing handoff with success.
 * @description
 * The Awtsmoos knows when one shliach intentionally lays down a task even though the
 * mission still calls. Awtsmoos.com keeps terminal ownership for that predecessor while
 * `lastOutcome.complete` remains false until declared remaining work truly reaches zero.
 */
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

/**
 * Terminalizes one predecessor while preserving explicit remaining-work testimony.
 *
 * @param {object} agent Durable website-agent record.
 * @param {object} input Explicit completion payload from that agent.
 * @returns {object} Updated agent.
 */
function completeAgent(agent, input = {}) {
	const remainingWork = list(input.remainingWork || input.remaining || input.nextWork);
	const handoffPaths = list(input.handoffPaths || input.files || input.references);
	const trulyComplete = remainingWork.length === 0;
	agent.status = "complete";
	agent.lifecycle = trulyComplete ? "completed" : "completed_with_remaining_work";
	agent.intentionalFinish = true;
	agent.finishedAt = new Date().toISOString();
	agent.roomDirty = false;
	agent.pendingRoomMessages = 0;
	agent.lastOutcome = {
		complete: trulyComplete,
		intentional: true,
		lifecycle: agent.lifecycle,
		status: trulyComplete ? "COMPLETE" : "HANDOFF_REMAINING",
		reportId: String(input.reportId || "").slice(0, 200) || null,
		next: String(input.next || remainingWork[0] || "").slice(0, 2000),
		remainingWork,
		handoffPaths,
		files: list(input.files || input.references),
		roomMessage: agent.lastUpdate,
		findings: String(input.findings || input.evidence || agent.lastUpdate).slice(0, 4000),
		hasStructuredStatus: true
	};
	return agent;
}

function verified(input = {}, body = "") {
	const explicit = input.complete === true || input.complete === "true";
	if (!explicit) return false;
	return Boolean(
		String(body || input.evidence || "").trim() ||
		list(input.references).length ||
		list(input.handoffPaths).length
	);
}

function hasReport(record, agentId, reportId) {
	return (record.events || []).some(item =>
		item.reportId === reportId &&
		String(item.fromAgent || "") === String(agentId || "control-room-human")
	);
}

function response(record, roomMessage, terminal, reportId) {
	const agent = record.agents?.find(item => item.id === roomMessage?.fromAgent);
	return {
		ok: true,
		action: "websiteAgentMissionMessage",
		websiteMissionId: record.id,
		missionId: record.missionId,
		reportId: reportId || null,
		duplicate: false,
		lifecycle: agent?.lifecycle || null,
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
	if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean).slice(0, 100);
	return String(value || "").split(/[\n,]+/)
		.map(item => item.trim()).filter(Boolean).slice(0, 100);
}

module.exports = { apply, completeAgent, duplicateResponse, hasReport, response, verified };
