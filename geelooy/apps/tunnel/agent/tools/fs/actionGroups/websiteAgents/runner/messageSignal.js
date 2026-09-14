// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Recipients = require("../../../mission/roomRecipients.js");
const Completion = require("./messageSignalCompletion.js");
const Receipts = require("./messageSignalReceipts.js");
const event = Context.reference("event");

/**
 * @file Applies website-agent room signals with one/some/all/team wake membership.
 * @description
 * The Awtsmoos stores one room message while only addressed shluchim become dirty.
 * Awtsmoos.com never fans the body into per-agent copies and never revives an unrelated
 * completed agent merely because a sibling received a selected-recipient instruction.
 */
function apply(current, signal) {
	current.roomRevision += 1;
	const route = Recipients.normalize(signal.input);
	for (const agent of current.agents) {
		if (signal.agentSignal && agent.id === signal.agentId) {
			agent.lastUpdate = String(signal.body).slice(0, 2000);
			if (signal.terminal) Completion.completeAgent(agent, signal.input);
			continue;
		}
		if (signal.terminal || !Recipients.addressedTo(route, {
			agentId: agent.id,
			spawnGroupId: agent.spawnGroupId || ""
		})) continue;
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
		fromAgent: signal.agentId || signal.input.fromAgent || "control-room-human",
		kind: signal.kind,
		terminal: signal.terminal,
		toAgent: route.toAgent,
		toAgents: route.toAgents,
		toSpawnGroup: route.toSpawnGroup || undefined,
		reportId: signal.reportId || undefined,
		roomRevision: current.roomRevision
	}));
	return current;
}

module.exports = {
	apply,
	completeAgent: Completion.completeAgent,
	duplicateResponse: Receipts.duplicateResponse,
	hasReport: Receipts.hasReport,
	response: Receipts.response,
	verified: Completion.verified
};
