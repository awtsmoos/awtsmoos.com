// B"H
// Boruch Hashem
// Blessed is He

const State = require("./roomClaimState.js");

/**
 * @file Grants one generation-scoped Mission Room owner per concrete task.
 * @description
 * The Awtsmoos grants one living shliach one task-vessel. Awtsmoos.com renews a
 * healthy owner's lease, blocks peers, and supersedes expired or fenced generations
 * before a successor receives the same task, never letting two incarnations mutate it.
 */
function claimTask(room, input, env) {
	const agentId = env.RoomState.agentId(input);
	const task = resolveTask(room, input, agentId, env);
	const taskId = task?.id || env.RoomState.text(input.taskId || input.splitTaskId || input.claimTaskId || "");
	const title = task?.title || env.RoomState.text(input.title || "Claimed room task");
	const now = env.RoomState.now();
	const leaseMs = State.boundedLease(input.claimLeaseMs ?? input.leaseMs);
	const active = (room.claims || []).filter(claim => claim.status === "active" && sameTask(claim, taskId, title));
	const own = active.find(claim => sameOwner(claim, input, agentId) && !State.claimExpired(claim, now));
	if (own) return reuse(room, own, agentId, now, leaseMs);
	const conflict = active.find(claim => !sameOwner(claim, input, agentId) && State.ownerHealthy(room, claim, now));
	if (conflict) return conflictReceipt(conflict, taskId);
	const obsolete = active.filter(claim => !State.ownerHealthy(room, claim, now));
	for (const claim of obsolete) State.supersede(room, claim, agentId, now);
	const claim = createClaim(room, { input, env, agentId, task, taskId, title, now, leaseMs,
		replaced: obsolete[0] || null });
	room.claims ||= [];
	room.claims.push(claim);
	if (task) task.status = "claimed";
	State.synchronize(room, agentId, claim);
	return claim;
}

function claimForAgent(room, agentId, now = new Date().toISOString(), generation = 0) {
	return (room.claims || []).find(claim => claim.status === "active" && claim.agentId === agentId &&
		(!generation || !claim.generation || Number(claim.generation) === Number(generation)) &&
		!State.claimExpired(claim, now)) || null;
}

function reuse(room, claim, agentId, now, leaseMs) {
	claim.renewedAt = now;
	claim.expiresAt = new Date(Date.parse(now) + leaseMs).toISOString();
	State.synchronize(room, agentId, claim);
	return { ...claim, reused: true };
}

function conflictReceipt(claim, taskId) {
	return { ok: false, conflict: true, taskId, ownerAgentId: claim.agentId,
		ownerGeneration: claim.generation || 0, claimId: claim.id, expiresAt: claim.expiresAt || null };
}

function createClaim(room, { input, env, agentId, task, taskId, title, now, leaseMs, replaced }) {
	const existing = room.agentRuntime?.[agentId] || room.agents?.[agentId] || {};
	const generation = positive(input.generation || existing.generation, 1);
	return { id: input.claimId || env.RoomState.id("room_claim"), at: now, claimedAt: now,
		renewedAt: now, expiresAt: new Date(Date.parse(now) + leaseMs).toISOString(), agentId,
		logicalAgentId: String(input.logicalAgentId || agentId), agentSessionId: String(input.agentSessionId || existing.agentSessionId || ""),
		generation, spawnGroupId: String(input.spawnGroupId || existing.spawnGroupId || ""),
		parentAgentId: String(input.parentAgentId || existing.parentAgentId || ""),
		predecessorAgentId: String(input.predecessorAgentId || existing.predecessorAgentId || ""),
		taskId, subMissionId: env.RoomState.text(input.subMissionId || ""), title,
		files: task?.files || env.RoomState.list(input.files), status: "active",
		replacesClaimId: replaced?.id || null, takeover: Boolean(replaced) };
}

function sameOwner(claim, input, agentId) {
	if (claim.agentId !== agentId) return false;
	const requestedGeneration = Number(input.generation || 0);
	return !requestedGeneration || !claim.generation || Number(claim.generation) === requestedGeneration;
}

function resolveTask(room, input, agentId, env) {
	const wanted = env.RoomState.text(input.taskId || input.splitTaskId || input.claimTaskId || "");
	for (const proposal of room.splitProposals || []) {
		const task = (proposal.tasks || []).find(item => item.id === wanted || !wanted && item.agentId === agentId);
		if (task) return task;
	}
	return null;
}

function sameTask(claim, taskId, title) {
	return taskId ? claim.taskId === taskId : !claim.taskId && claim.title === title;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 1 ? number : fallback;
}

module.exports = { DEFAULT_LEASE_MS: State.DEFAULT_LEASE_MS, claimExpired: State.claimExpired,
	claimForAgent, claimTask, ownerHealthy: State.ownerHealthy };
