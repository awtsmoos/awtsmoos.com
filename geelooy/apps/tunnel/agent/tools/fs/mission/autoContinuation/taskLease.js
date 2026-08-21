// B"H
// Boruch Hashem
// Blessed is He

const ContinuationRequests = require("../roomContinuationRequests.js");

/**
 * @file Requires declared continuation intent plus unfinished concrete task custody.
 * @description
 * The Awtsmoos does not summon a successor from an idle sentence alone. Awtsmoos.com
 * joins two witnesses: the predecessor explicitly requested continuity before work, and
 * a claim or delegation still proves that concrete work remains unfinished.
 */
function select(mission = {}, predecessor = {}, now = Date.now()) {
	const room = mission.room || mission.collaboration || {};
	const predecessorId = String(predecessor.agentId || predecessor.logicalAgentId || "");
	const generation = positive(predecessor.generation, 1);
	const continuation = ContinuationRequests.activeFor(mission, predecessorId, generation);
	if (!continuation) return null;
	const claim = activeClaim(room, predecessorId, now);
	if (claim) return leaseFrom("claim", claim, predecessorId, continuation);
	const delegation = activeDelegation(room, predecessorId);
	if (delegation) return leaseFrom("delegation", delegation, predecessorId, continuation);
	return null;
}

function activeClaim(room, predecessorId, now) {
	return (room.claims || []).find(claim => {
		if (String(claim.status || "").toLowerCase() !== "active") return false;
		if (predecessorId && String(claim.agentId || claim.logicalAgentId || "") !== predecessorId) return false;
		const expiresAt = Date.parse(claim.expiresAt || "");
		return !Number.isFinite(expiresAt) || expiresAt > now;
	}) || null;
}

function activeDelegation(room, predecessorId) {
	return (room.delegations || []).find(item => {
		const status = String(item.status || "open").toLowerCase();
		if (["done", "completed", "closed", "cancelled", "failed"].includes(status)) return false;
		const owner = String(item.toAgent || item.agentId || item.owner || "");
		return !predecessorId || owner === predecessorId;
	}) || null;
}

function leaseFrom(kind, record, predecessorId, continuation) {
	return { kind, leaseId: String(record.id || ""),
		taskId: String(record.taskId || record.splitTaskId || record.title || continuation.taskId || ""),
		ownerAgentId: predecessorId || String(record.agentId || record.toAgent || ""),
		generation: positive(record.generation || continuation.generation, 1),
		expiresAt: record.expiresAt || null, continuationRequestId: continuation.id };
}

function positive(value, fallback) { const number = Number(value); return Number.isSafeInteger(number) && number >= 1 ? number : fallback; }

module.exports = { activeClaim, activeDelegation, select };
