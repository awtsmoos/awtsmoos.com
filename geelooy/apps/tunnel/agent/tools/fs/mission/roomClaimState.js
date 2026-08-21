// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_LEASE_MS = 5 * 60 * 1000;
const MIN_LEASE_MS = 30 * 1000;
const MAX_LEASE_MS = 60 * 60 * 1000;
const STALE_MS = 15 * 60 * 1000;
const ENDED = new Set(["completed", "ended", "stopped", "failed", "cancelled", "inactive", "superseded"]);

/**
 * @file Owns generation-aware Mission Room claim lifetime and safe supersession.
 * @description
 * The Awtsmoos lets one task have one living messenger at a time. Awtsmoos.com
 * refuses to call an old generation healthy merely because its logical name matches
 * the new one; lease, heartbeat, status, and generation must all testify together.
 */
function boundedLease(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) return DEFAULT_LEASE_MS;
	return Math.max(MIN_LEASE_MS, Math.min(MAX_LEASE_MS, Math.floor(number)));
}

function claimExpired(claim, now) {
	if (!claim?.expiresAt) return false;
	const expires = Date.parse(claim.expiresAt);
	const current = Date.parse(now);
	return Number.isFinite(expires) && Number.isFinite(current) && expires <= current;
}

function ownerHealthy(room, claim, now) {
	if (!claim?.agentId || claimExpired(claim, now)) return false;
	const runtime = room.agentRuntime?.[claim.agentId] || {};
	const publicAgent = room.agents?.[claim.agentId] || {};
	const status = String(publicAgent.status || runtime.status || "").toLowerCase();
	const leaseStatus = String(runtime.lease?.status || "").toLowerCase();
	if (ENDED.has(status) || ENDED.has(leaseStatus) || runtime.lease?.active === false) return false;
	if (generationMismatch(claim, runtime, publicAgent)) return false;
	const heartbeat = Date.parse(runtime.heartbeat || publicAgent.lastSeenAt || 0);
	const current = Date.parse(now);
	return Number.isFinite(heartbeat) && Number.isFinite(current) && current - heartbeat <= STALE_MS;
}

function generationMismatch(claim = {}, runtime = {}, publicAgent = {}) {
	const claimed = Number(claim.generation || 0);
	const living = Number(runtime.generation || publicAgent.generation || 0);
	const fencedThrough = Number(runtime.fencedThroughGeneration || publicAgent.fencedThroughGeneration || 0);
	if (claimed > 0 && claimed <= fencedThrough) return true;
	return claimed > 0 && living > 0 && claimed !== living;
}

function synchronize(room, agentId, claim) {
	const publicAgent = room.agents?.[agentId];
	if (publicAgent) {
		publicAgent.currentClaim = claim;
		publicAgent.lastSeenAt = claim.renewedAt || claim.at;
		if (claim.generation) publicAgent.generation = claim.generation;
	}
	const runtime = room.agentRuntime?.[agentId];
	if (runtime) {
		runtime.currentClaim = claim;
		if (claim.generation) runtime.generation = claim.generation;
	}
}

function supersede(room, claim, byAgentId, now) {
	claim.status = "superseded";
	claim.supersededAt = now;
	claim.supersededByAgentId = byAgentId;
	clearCurrent(room, claim.agentId, claim.id);
}

function clearCurrent(room, agentId, claimId) {
	for (const record of [room.agents?.[agentId], room.agentRuntime?.[agentId]]) {
		if (record?.currentClaim?.id === claimId) record.currentClaim = null;
	}
}

module.exports = { DEFAULT_LEASE_MS, boundedLease, claimExpired, generationMismatch,
	ownerHealthy, supersede, synchronize };
