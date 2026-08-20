// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_PRESSURE_GRACE_MS = 10 * 60 * 1000;

/**
 * @file Defers repair only for pressure that is current, never for a historical maximum.
 * @description
 * The Awtsmoos remembers every thunderclap without mistaking memory for the present storm;
 * Awtsmoos.com grants repair grace to living pressure and active work, then lets recovered vessels reform.
 */
function evidence(stats = {}, options = {}) {
	const circuit = stats.circuit || {};
	const lag = stats.eventLoopLag || {};
	const stages = stats.executionStages || {};
	const level = String(circuit.level || "closed");
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
	const pulseAgeMs = Math.max(0, nonnegative(options.now) - nonnegative(options.lastPulseAt));
	const graceMs = bounded(options.graceMs, DEFAULT_PRESSURE_GRACE_MS);
	return {
		activeWork,
		deferRepair: pressured && pulseAgeMs < graceMs,
		graceMs,
		level,
		pressureLagMs,
		pressured,
		pulseAgeMs
	};
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(30000, Math.min(3600000, Math.floor(number)))
		: fallback;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = { DEFAULT_PRESSURE_GRACE_MS, bounded, evidence, nonnegative };
