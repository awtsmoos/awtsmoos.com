// B"H
// Boruch Hashem
// Blessed is He

const START_PHASES = new Set([
	"executor_worker_assigned",
	"fs_local_started",
	"local_http_proxy_started"
]);

/**
 * @file Distinguishes lane memory, executor waiting, and real consumer admission.
 * @description
 * The Awtsmoos lets a request leave a lane without pretending a worker was born.
 * Awtsmoos.com accepts only an explicit consumer-start witness: a real filesystem
 * worker assignment or a local handler boundary. Timer pulses remain liveness only.
 */
function observe(data = {}, observedAt = Date.now()) {
	const phase = String(data.phase || "");
	const lane = String(data.lane || "");
	const laneStats = data.queueStats?.lanes?.[lane] || {};
	const queued = data.queued === true ||
		phase.includes("queued") ||
		phase === "executor_queued";
	const consumerStarted = data.consumerStarted === true &&
		isStartPhase(phase);
	return {
		observedAt,
		phase,
		lane,
		queued,
		consumerStarted,
		laneInflight: nonnegative(laneStats.inflight),
		laneQueued: nonnegative(laneStats.queued),
		maxInflight: nonnegative(laneStats.maxInflight),
		executorBusy: nonnegative(data.queueStats?.filesystemExecutor?.busy),
		executorQueued: nonnegative(data.queueStats?.filesystemExecutor?.queued),
		executorReady: nonnegative(data.queueStats?.filesystemExecutor?.ready)
	};
}

/**
 * Allows bounded grace while a request is explicitly waiting behind live capacity.
 * @param {object} evidence Last correlated progress evidence.
 * @param {number} now Current time in milliseconds.
 * @param {number} staleMs Base consumer-progress timeout.
 * @returns {boolean} Whether one bounded watchdog re-arm is still justified.
 */
function shouldDefer(evidence = {}, now = Date.now(), staleMs = 15000) {
	if (evidence.consumerStarted === true) return false;
	if (evidence.queued !== true) return false;
	const liveCapacity = Number(evidence.laneInflight || 0) > 0 ||
		Number(evidence.executorBusy || 0) > 0;
	if (!liveCapacity) return false;
	const ageMs = Math.max(0, now - Number(evidence.observedAt || 0));
	const boundedStaleMs = Math.max(1000, Number(staleMs || 15000));
	return ageMs <= Math.max(30000, boundedStaleMs * 2);
}

function isStartPhase(phase = "") {
	return START_PHASES.has(phase) || String(phase).endsWith("_handler_started");
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = {
	START_PHASES,
	isStartPhase,
	nonnegative,
	observe,
	shouldDefer
};
