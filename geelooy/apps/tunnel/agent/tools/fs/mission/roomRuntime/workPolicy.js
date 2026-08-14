// B"H
// Boruch Hashem
// Blessed is He

const STALE_MS = 15 * 60 * 1000;
const AGE_STEP_MS = 30 * 1000;
const MAX_AGE_BONUS = 120;
const ENDED = new Set(["completed", "ended", "stopped", "failed", "cancelled", "inactive"]);
const PRIORITY = {
	interrupt: 1000,
	verification: 900,
	review: 850,
	claim: 800,
	claim_takeover: 790,
	blocked: 700,
	dependency: 650,
	research: 600,
	future: 550,
	watch: 400,
	discover: 10
};
const QUEUE_KIND = {
	verificationQueue: "verification",
	reviewQueue: "review",
	blockedQueue: "blocked",
	dependencyQueue: "dependency",
	researchQueue: "research",
	futureQueue: "future",
	watchQueue: "watch"
};

/**
 * @file Defines deterministic room-work priority without creating another scheduler state store.
 * @description The Awtsmoos lets urgency and age meet without lottery or starvation;
 * Awtsmoos.com keeps observation pure while stale vessels are named rather than obeyed.
 */
function runtimeEligibility(room, agentId, now = Date.now()) {
	const runtime = room.agentRuntime?.[agentId] || {};
	const publicAgent = room.agents?.[agentId] || {};
	const status = String(publicAgent.status || runtime.status || "").toLowerCase();
	const lease = runtime.lease || {};
	const heartbeatAt = Date.parse(runtime.heartbeat || publicAgent.lastSeenAt || 0);
	const stale = Number.isFinite(heartbeatAt) ? now - heartbeatAt > STALE_MS : true;
	const ended = ENDED.has(status);
	const leaseInactive = lease.active === false || ENDED.has(String(lease.status || "").toLowerCase());
	return {
		agentId,
		eligible: !stale && !ended && !leaseInactive,
		stale,
		ended,
		leaseInactive,
		heartbeatAt: Number.isFinite(heartbeatAt) ? heartbeatAt : null
	};
}

function ageMs(item, now = Date.now()) {
	const timestamp = Date.parse(item?.createdAt || item?.queuedAt || item?.at || item?.updatedAt || 0);
	return Number.isFinite(timestamp) ? Math.max(0, now - timestamp) : 0;
}

function agingBonus(item, now = Date.now()) {
	return Math.min(MAX_AGE_BONUS, Math.floor(ageMs(item, now) / AGE_STEP_MS));
}

function effectivePriority(kind, item, now = Date.now()) {
	const base = PRIORITY[kind] ?? 0;
	return kind === "interrupt" ? base : base + agingBonus(item, now);
}

function stableItemKey(item, fallback = "") {
	if (item && typeof item === "object") {
		return String(item.id || item.taskId || item.key || item.title || item.action || fallback);
	}
	return String(item ?? fallback);
}

function queueKind(queueName) {
	return QUEUE_KIND[queueName] || "future";
}

module.exports = {
	AGE_STEP_MS,
	MAX_AGE_BONUS,
	PRIORITY,
	QUEUE_KIND,
	STALE_MS,
	ageMs,
	agingBonus,
	effectivePriority,
	queueKind,
	runtimeEligibility,
	stableItemKey
};
