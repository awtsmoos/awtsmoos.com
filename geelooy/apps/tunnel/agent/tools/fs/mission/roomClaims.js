// B"H
// Boruch Hashem
// Blessed is He

const State = require("./roomClaimState.js");

/**
 * @file Orchestrates claim creation, reuse, conflict, and takeover around one state engine.
 * @description The Awtsmoos grants one living owner per task; Awtsmoos.com lets renewed
 * testimony remain one row and supersedes every obsolete witness before replacement.
 */
function claimTask(room, input, env) {
	const agentId = env.RoomState.agentId(input);
	const task = resolveTask(room, input, agentId, env);
	const taskId = task?.id || env.RoomState.text(input.taskId || input.splitTaskId || input.claimTaskId || "");
	const title = task?.title || env.RoomState.text(input.title || "Claimed room task");
	const now = env.RoomState.now();
	const leaseMs = State.boundedLease(input.claimLeaseMs ?? input.leaseMs);
	const active = (room.claims || []).filter(claim => claim.status === "active" && sameTask(claim, taskId, title));
	const own = active.find(claim => claim.agentId === agentId && !State.claimExpired(claim, now));
	if (own) return reuse(room, own, agentId, now, leaseMs);
	const conflict = active.find(claim => claim.agentId !== agentId && State.ownerHealthy(room, claim, now));
	if (conflict) return conflictReceipt(conflict, taskId);
	const obsolete = active.filter(claim => !State.ownerHealthy(room, claim, now));
	for (const claim of obsolete) State.supersede(room, claim, agentId, now);
	const replaced = obsolete[0] || null;
	const claim = createClaim({ input, env, agentId, task, taskId, title, now, leaseMs, replaced });
	room.claims ||= [];
	room.claims.push(claim);
	if (task) task.status = "claimed";
	State.synchronize(room, agentId, claim);
	return claim;
}

function claimForAgent(room, agentId, now = new Date().toISOString()) {
	return (room.claims || []).find(claim =>
		claim.status === "active" && claim.agentId === agentId && !State.claimExpired(claim, now)
	) || null;
}

function reuse(room, claim, agentId, now, leaseMs) {
	claim.renewedAt = now;
	claim.expiresAt = new Date(Date.parse(now) + leaseMs).toISOString();
	State.synchronize(room, agentId, claim);
	return { ...claim, reused: true };
}

function conflictReceipt(claim, taskId) {
	return {
		ok: false,
		conflict: true,
		taskId,
		ownerAgentId: claim.agentId,
		claimId: claim.id,
		expiresAt: claim.expiresAt || null
	};
}

function createClaim({ input, env, agentId, task, taskId, title, now, leaseMs, replaced }) {
	return {
		id: input.claimId || env.RoomState.id("room_claim"),
		at: now,
		claimedAt: now,
		renewedAt: now,
		expiresAt: new Date(Date.parse(now) + leaseMs).toISOString(),
		agentId,
		taskId,
		subMissionId: env.RoomState.text(input.subMissionId || ""),
		title,
		files: task?.files || env.RoomState.list(input.files),
		status: "active",
		replacesClaimId: replaced?.id || null,
		takeover: Boolean(replaced)
	};
}

function resolveTask(room, input, agentId, env) {
	const wanted = env.RoomState.text(input.taskId || input.splitTaskId || input.claimTaskId || "");
	for (const proposal of room.splitProposals || []) {
		const task = (proposal.tasks || []).find(item => item.id === wanted || (!wanted && item.agentId === agentId));
		if (task) return task;
	}
	return null;
}

function sameTask(claim, taskId, title) {
	return taskId ? claim.taskId === taskId : !claim.taskId && claim.title === title;
}

module.exports = {
	DEFAULT_LEASE_MS: State.DEFAULT_LEASE_MS,
	claimExpired: State.claimExpired,
	claimForAgent,
	claimTask,
	ownerHealthy: State.ownerHealthy
};
