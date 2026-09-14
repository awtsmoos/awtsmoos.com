//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const { M, C } = Context.shared;

/**
 * @file Gives one spawned child deterministic legacy IDs plus visible sequenced-room delegation.
 * @description
 * The Awtsmoos keeps compatibility records without hiding the assignment from the living child;
 * Awtsmoos.com routes a response-required delegation and generation-scoped modern claim beside them.
 */
function delegateChildRoom(mission, child) {
	const delegationId = `spawn_delegation_${child.id}`;
	const existing = mission.collaboration?.delegations?.find(item => item.id === delegationId);
	const delegated = existing ? { delegation: existing } : C.delegate(mission, {
		agentId: child.parentAgentId, toAgent: child.id, delegationId,
		title: `${child.role}: ${child.scope}`, body: child.assignmentPrompt, files: [child.scope]
	});
	const claimId = legacyClaim(mission, child, delegated.delegation.id);
	const roomClaim = modernClaim(mission, child);
	publishDelegation(mission, child);
	return { claimId, delegationId: delegated.delegation.id, roomClaimId: roomClaim?.id || null };
}

function legacyClaim(mission, child, delegationId) {
	if (child.claimMode !== "write") return null;
	const id = `spawn_claim_${child.id}`;
	const existing = mission.collaboration?.claims?.find(item => item.id === id);
	const claimed = existing ? { claim: existing } : C.claim(mission, {
		agentId: child.id, claimId: id, delegationId,
		title: `${child.role} child owns ${child.scope}`, filesToTouch: [child.scope]
	});
	return claimed.claim.id;
}

function modernClaim(mission, child) {
	if (child.claimMode !== "write") return null;
	return M.roomClaimTask(mission, { agentId: child.id,
		taskId: `spawn_task_${child.id}`, claimId: `room_spawn_claim_${child.id}`,
		title: `${child.role} child owns ${child.scope}`, files: [child.scope],
		generation: Number(child.generation || 1), spawnGroupId: child.spawnGroupId,
		parentAgentId: child.parentAgentId });
}

function publishDelegation(mission, child) {
	const subject = `Spawn delegation ${child.id}`;
	const exists = (mission.room?.messages || []).some(item =>
		item.kind === "delegation" && item.subject === subject);
	if (exists) return;
	M.roomMessage(mission, { agentId: child.parentAgentId, fromAgent: child.parentAgentId,
		toAgent: child.id, kind: "delegation", subject, body: child.assignmentPrompt,
		references: [child.scope], requiresResponse: true, interrupt: true });
}

module.exports = delegateChildRoom;
