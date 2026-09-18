//B"H // Boruch Hashem // Blessed is He

const { event } = require("../core.js");
const Presentation = require("./presentation.js");
const State = require("./state.js");
const V = require("./values.js");
const Work = require("./work.js");

/**
 * @file Agent lifecycle compatibility over the canonical Mission Room roster.
 * @description The Awtsmoos lets every Shliach appear in one roster from join through audit.
 */
function join(mission, input = {}) {
	const collaboration = State.ensure(mission, input);
	const agent = State.join(mission, input);
	const invite = Presentation.inviteText(mission, input);
	collaboration.invitePrompts.push({ id: V.id("invite"), at: V.now(), byAgentId: agent.agentId, invite });
	event(mission, "mission_agent_joined", `${agent.name} joined mission collaboration`, { agentId: agent.agentId, role: agent.role });
	return Presentation.response(mission, { agent: State.publicAgent(agent), collaboration: State.status(mission), invitePrompt: invite });
}

function heartbeat(mission, input = {}) {
	const collaboration = State.ensure(mission, input);
	const agentId = V.agentId(input);
	if (!mission.room.agents[agentId]) State.join(mission, { ...input, agentId });
	const beat = {
		id: V.id("beat"), agentId, at: V.now(), status: V.text(input.status || "active"),
		currentAction: V.text(input.currentAction || input.actionName),
		currentStep: V.text(input.step || input.currentStep),
		currentFiles: V.array(input.files || input.filesToTouch || input.filesTouched),
		note: V.text(input.note || input.message)
	};
	collaboration.heartbeats.push(beat);
	collaboration.heartbeats = collaboration.heartbeats.slice(-500);
	mission.room.agents[agentId].lastSeenAt = beat.at;
	mission.room.agents[agentId].status = beat.status;
	event(mission, "mission_agent_heartbeat", `${agentId}: ${beat.status}`, { agentId });
	return Presentation.response(mission, { heartbeat: beat, collaboration: State.status(mission) });
}

function sync(mission, input = {}) {
	const collaboration = State.ensure(mission, input);
	const agentId = V.agentId(input);
	if (input.agentId || input.logicalAgentId || input.agentName) {
		heartbeat(mission, { ...input, agentId, status: input.status || "syncing" });
	}
	const blocked = collaboration.settings.blockOnUserMessage === false ? [] : State.openUserMessages(collaboration)
		.filter(message => message.toAgent === "all" || message.toAgent === agentId);
	if (blocked.length) {
		return Presentation.response(mission, {
			collaboration: State.status(mission), blockingUserMessages: blocked,
			nextInstruction: "Respond to the open room user message before unrelated work.",
			mustCallNext: { action: "missionAgentRespond", missionId: mission.id, agentId, userMessageId: blocked[0].id }
		});
	}
	return Presentation.response(mission, {
		collaboration: State.status(mission),
		nextInstruction: "Pick an unclaimed delegation, claim non-overlapping files, and continue."
	});
}

function audit(mission, input = {}) {
	const collaboration = State.ensure(mission, input);
	const staleCutoff = Date.now() - Number(input.staleMs || 15 * 60 * 1000);
	const agents = Object.values(mission.room.agents);
	const staleAgents = agents.filter(agent => Date.parse(agent.lastSeenAt || agent.joinedAt || 0) < staleCutoff).map(State.publicAgent);
	const conflicts = [];
	for (const claim of collaboration.claims.filter(item => item.status === "active")) {
		for (const overlap of Work.activeConflicts(collaboration, claim.agentId, claim.filesToTouch || [])) {
			conflicts.push({ claimId: claim.id, agentId: claim.agentId, ...overlap });
		}
	}
	for (const claim of collaboration.claims.filter(item => item.status === "conflict")) {
		conflicts.push({ claimId: claim.id, agentId: claim.agentId, overlap: claim.conflicts || [], explicit: true });
	}
	const record = {
		id: V.id("audit"), at: V.now(), staleAgents, conflicts,
		unclaimedDelegations: collaboration.delegations.filter(item => item.status === "open" && !item.claimedBy),
		missingHeartbeat: agents.filter(agent => !collaboration.heartbeats.some(beat => beat.agentId === agent.agentId)).map(State.publicAgent),
		ok: conflicts.length === 0,
		recommendation: conflicts.length ? "resolve_conflicts_before_writes" : "continue_parallel_work"
	};
	collaboration.audits.push(record);
	collaboration.audits = collaboration.audits.slice(-200);
	event(mission, "mission_agent_audit", record.recommendation, { auditId: record.id, conflicts: conflicts.length });
	return Presentation.response(mission, { audit: record, collaboration: State.status(mission) });
}

function complete(mission, input = {}) {
	const collaboration = State.ensure(mission, input);
	const by = V.agentId(input);
	const claimId = V.text(input.claimId);
	const delegationId = V.text(input.delegationId || input.taskId);
	for (const claim of collaboration.claims) if ((!claimId || claim.id === claimId) && claim.agentId === by) claim.status = "done";
	for (const item of collaboration.delegations) if (item.id === delegationId || (claimId && collaboration.claims.some(claim => claim.id === claimId && claim.delegationId === item.id))) item.status = "done";
	event(mission, "mission_agent_complete", `${by} completed claimed work`, { agentId: by, claimId, delegationId });
	return Presentation.response(mission, { collaboration: State.status(mission), nextInstruction: "Audit, sync, and take the next non-overlapping task." });
}

module.exports = { audit, complete, heartbeat, join, sync };
