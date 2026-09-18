//B"H // Boruch Hashem // Blessed is He

const { addTask, event } = require("../core.js");
const Presentation = require("./presentation.js");
const State = require("./state.js");
const V = require("./values.js");

/**
 * @file Delegation and claim compatibility over the canonical Mission Room roster.
 * @description The Awtsmoos gives each task a visible messenger and each file a guarded owner.
 */
function delegate(mission, input = {}) {
	const collaboration = State.ensure(mission, input);
	const from = V.agentId(input);
	if (!mission.room.agents[from]) State.join(mission, { ...input, agentId: from });
	const toAgent = V.text(input.toAgent || input.to || "unclaimed");
	if (specific(toAgent) && !mission.room.agents[toAgent]) {
		State.join(mission, { agentId: toAgent, agentName: toAgent, role: input.toRole || "worker" });
	}
	const task = {
		id: input.delegationId || V.id("delegation"), at: V.now(), fromAgent: from, toAgent,
		title: V.text(input.title || input.task || input.goal || "Delegated mission work"),
		details: V.text(input.details || input.body || input.message || input.prompt),
		filesToTouch: V.array(input.filesToTouch || input.files || input.paths),
		whyEachFile: V.object(input.whyEachFile), tests: V.array(input.tests), risks: V.array(input.risks),
		status: "open", claimedBy: ""
	};
	collaboration.delegations.push(task);
	const target = mission.room.agents[toAgent];
	if (target) target.currentDelegationIds = unique([...(target.currentDelegationIds || []), task.id]);
	addTask(mission, `Delegated: ${task.title}`, { status: "open", kind: "agent-delegation", id: task.id });
	event(mission, "mission_agent_delegated", task.title, { delegationId: task.id, fromAgent: from, toAgent });
	return Presentation.response(mission, { delegation: task, collaboration: State.status(mission) });
}

function claim(mission, input = {}) {
	const collaboration = State.ensure(mission, input);
	const by = V.agentId(input);
	if (!mission.room.agents[by]) State.join(mission, { ...input, agentId: by });
	const files = V.array(input.filesToTouch || input.files || input.paths);
	const delegationId = V.text(input.delegationId || input.taskId);
	const conflicts = activeConflicts(collaboration, by, files);
	const claimRecord = {
		id: input.claimId || V.id("claim"), at: V.now(), agentId: by, delegationId,
		title: V.text(input.title || input.task || "Claimed work"), filesToTouch: files,
		whyEachFile: V.object(input.whyEachFile), status: conflicts.length ? "conflict" : "active", conflicts,
		leaseExpiresAt: new Date(Date.now() + Number(input.leaseMs || 3600000)).toISOString(),
		readBeforeWrite: true, fullRewriteRequired: true
	};
	collaboration.claims.push(claimRecord);
	const agent = mission.room.agents[by];
	agent.currentClaimIds = unique([...(agent.currentClaimIds || []), claimRecord.id]);
	const delegation = collaboration.delegations.find(item => item.id === delegationId);
	if (delegation) {
		delegation.claimedBy = by;
		delegation.status = conflicts.length ? "conflict" : "claimed";
		agent.currentDelegationIds = unique([...(agent.currentDelegationIds || []), delegation.id]);
	}
	event(mission, "mission_agent_claim", claimRecord.title, { claimId: claimRecord.id, agentId: by, conflicts: conflicts.length });
	const next = conflicts.length ? { action: "missionAgentAudit", missionId: mission.id, agentId: by } : { action: "missionAgentSync", missionId: mission.id, agentId: by };
	return Presentation.response(mission, { claim: claimRecord, collaboration: State.status(mission), nextSuggestedToolCall: next });
}

function activeConflicts(collaboration, by, files) {
	const requested = new Set(files.map(String));
	if (!requested.size) return [];
	return collaboration.claims
		.filter(item => item.status === "active" && item.agentId !== by)
		.map(item => ({ claimId: item.id, agentId: item.agentId, overlap: (item.filesToTouch || []).filter(file => requested.has(String(file))) }))
		.filter(item => item.overlap.length);
}

function specific(agentId) {
	return !["", "all", "*", "unclaimed"].includes(agentId);
}

function unique(values) {
	return [...new Set(values)];
}

module.exports = { activeConflicts, claim, delegate };
