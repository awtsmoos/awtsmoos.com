// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_LEASE_MS = 5 * 60 * 1000;
const MIN_LEASE_MS = 30 * 1000;
const MAX_LEASE_MS = 60 * 60 * 1000;
const STALE_MS = 15 * 60 * 1000;
const ENDED = new Set(["completed", "ended", "stopped", "failed", "cancelled", "inactive"]);

/**
 * @file Owns claim lifetime, liveness, synchronization, and safe supersession.
 * @description The Awtsmoos keeps old testimony from becoming accidental expiry;
 * Awtsmoos.com permits takeover only when an actual lease or living owner has ended.
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
	const heartbeat = Date.parse(runtime.heartbeat || publicAgent.lastSeenAt || 0);
	const current = Date.parse(now);
	return Number.isFinite(heartbeat) && Number.isFinite(current) && current - heartbeat <= STALE_MS;
}

function synchronize(room, agentId, claim) {
	const publicAgent = room.agents?.[agentId];
	if (publicAgent) {
		publicAgent.currentClaim = claim;
		publicAgent.lastSeenAt = claim.renewedAt || claim.at;
	}
	const runtime = room.agentRuntime?.[agentId];
	if (runtime) runtime.currentClaim = claim;
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

module.exports = {
	DEFAULT_LEASE_MS,
	boundedLease,
	claimExpired,
	ownerHealthy,
	supersede,
	synchronize
};
