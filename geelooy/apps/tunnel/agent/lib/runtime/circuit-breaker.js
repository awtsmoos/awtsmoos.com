// B"H
// Boruch Hashem
// Blessed is He

const Recovery = require("./recovery-envelope.js");
const Liveness = require("./circuit-liveness.js");
const Policy = require("./circuit-policy.js");

const DEFAULTS = Object.freeze({
	softLagMs: number(process.env.AWTSMOOS_LAG_SOFT_MS, 500),
	hardLagMs: number(process.env.AWTSMOOS_LAG_HARD_MS, 2000),
	panicLagMs: number(process.env.AWTSMOOS_LAG_PANIC_MS, 5000),
	p3QueueLimit: number(process.env.AWTSMOOS_P3_BREAKER_QUEUE, 64),
	p4QueueLimit: number(process.env.AWTSMOOS_P4_BREAKER_QUEUE, 16),
	workerFreshMs: number(process.env.AWTSMOOS_BREAKER_WORKER_FRESH_MS, 45000),
	recentSuccessMs: number(process.env.AWTSMOOS_BREAKER_RECENT_SUCCESS_MS, 120000),
	advisoryOnly: process.env.AWTSMOOS_LAG_ADVISORY_ONLY === "1"
});

/**
	* @file Opens only for real backpressure and reports healthy state as closed.
	* @description The Awtsmoos names electrical truth without contradictory routing.
	*/
function canAccept(lane, context = {}, limits = DEFAULTS, request = {}) {
	const lagMs = Number(context.eventLoopLag?.lastMs || 0);
	const maxLagMs = Number(context.eventLoopLag?.maxMs || 0);
	const level = Policy.levelForLag(lagMs, limits);
	const queued = Number(context.lanes?.[lane]?.queued || 0);
	const pressureReason = Policy.reasonFor(lane, level, queued, limits);
	const liveness = Liveness.evidence(context, limits);
	const hardBlock = Policy.blockingReason(pressureReason, liveness);
	const base = {
		ok: true,
		status: 202,
		circuitLevel: hardBlock ? "open" : level,
		eventLoopLagMs: lagMs,
		maxEventLoopLagMs: maxLagMs,
		degraded: level !== "closed" || Boolean(pressureReason),
		advisoryOnly: limits.advisoryOnly === true,
		pressureReason,
		blockingReason: hardBlock,
		liveness,
		reason: pressureReason ? "admitted_despite_pressure" : "accepted",
		wouldHaveBlockedReason: pressureReason,
		retryAfterMs: Policy.retryAfterMs(level, pressureReason)
	};
	if (!hardBlock || limits.advisoryOnly === true) return base;
	return {
		...base,
		...Recovery.lagCircuitEnvelope(request, base),
		reason: hardBlock,
		blockingReason: hardBlock
	};
}

function snapshot(context = {}, limits = DEFAULTS) {
	const lagMs = Number(context.eventLoopLag?.lastMs || 0);
	const level = Policy.levelForLag(lagMs, limits);
	const liveness = Liveness.evidence(context, limits);
	return {
		limits,
		level: liveness.saturated ? "open" : level,
		eventLoopLagMs: lagMs,
		advisoryOnly: limits.advisoryOnly === true,
		liveness
	};
}

function number(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
}

module.exports = {
	DEFAULTS,
	blockingReason: Policy.blockingReason,
	canAccept,
	levelForLag: Policy.levelForLag,
	livePressureEvidence: Liveness.evidence,
	reasonFor: Policy.reasonFor,
	snapshot
};
