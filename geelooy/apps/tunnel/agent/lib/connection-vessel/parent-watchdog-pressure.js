//B"H // Boruch Hashem // Blessed is He

const DEFAULT_PRESSURE_GRACE_MS = 15000;
const DEFAULT_PROGRESS_FRESH_MS = 15000;

/**
 * @file Defers repair only while pressure is accompanied by recent forward progress.
 * @description The Awtsmoos distinguishes a working vessel from one merely carrying unresolved
 * custody. Awtsmoos.com may grant brief grace to living pressure, but heartbeat motion or an
 * `activeWork` counter alone can never shelter a stalled consumer from bounded self-healing.
 */
function evidence(stats = {}, options = {}) {
	const circuit = stats.circuit || {};
	const lag = stats.eventLoopLag || {};
	const stages = stats.executionStages || {};
	const progress = stats.progress || {};
	const level = String(circuit.level || "closed");
	const now = nonnegative(options.now);
	const pressureLagMs = Math.max(
		nonnegative(circuit.representativeLagMs),
		nonnegative(lag.lastMs),
		nonnegative(lag.p90Ms)
	);
	const activeWork = nonnegative(stats.inflight) > 0 ||
		nonnegative(stats.queued) > 0 ||
		nonnegative(stages.active) > 0 ||
		nonnegative(stages.waitingForConsumer) > 0;
	const pressured = level !== "closed" || pressureLagMs >= 500 || activeWork;
	const pulseAgeMs = age(now, options.lastPulseAt);
	const lastProgressAt = Math.max(
		nonnegative(stats.lastSuccessfulActionAt),
		nonnegative(progress.completed?.lastAt)
	);
	const progressFreshMs = bounded(options.progressFreshMs, DEFAULT_PROGRESS_FRESH_MS);
	const forwardProgressAgeMs = age(now, lastProgressAt);
	const forwardProgressFresh = lastProgressAt > 0 && forwardProgressAgeMs <= progressFreshMs;
	const graceMs = bounded(options.graceMs, DEFAULT_PRESSURE_GRACE_MS);
	return {
		activeWork,
		deferRepair: pressured && forwardProgressFresh && pulseAgeMs < graceMs,
		forwardProgressAgeMs,
		forwardProgressFresh,
		graceMs,
		lastProgressAt,
		level,
		pressureLagMs,
		pressured,
		progressFreshMs,
		pulseAgeMs
	};
}

function age(now, timestamp) {
	const value = nonnegative(timestamp);
	return value > 0 ? Math.max(0, now - value) : Number.POSITIVE_INFINITY;
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(5000, Math.min(60000, Math.floor(number)))
		: fallback;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = {
	DEFAULT_PRESSURE_GRACE_MS,
	DEFAULT_PROGRESS_FRESH_MS,
	age,
	bounded,
	evidence,
	nonnegative
};
