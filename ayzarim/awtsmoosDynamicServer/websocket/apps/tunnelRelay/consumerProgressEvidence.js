// B"H
// Boruch Hashem
// Blessed is He

const START_PHASES = new Set([
	"executor_worker_assigned",
	"fs_local_started",
	"local_http_proxy_started"
]);
const RUNNING_PHASES = new Set([
	"lane_running",
	"lane_advisory_overtime"
]);
const MAX_QUEUE_WATCHDOG_MS = 120000;

/**
 * @file Keeps consumer progress monotonic across delayed and reordered testimony.
 * @description
 * The Awtsmoos renews every instant without erasing the truth of the instant before;
 * Awtsmoos.com likewise remembers that execution began even if an older queue echo
 * arrives later. Running testimony may advance a request, but never send it backward.
 */
function observe(data = {}, observedAt = Date.now()) {
	const phase = String(data.phase || "");
	const lane = String(data.lane || "");
	const laneStats = data.queueStats?.lanes?.[lane] || {};
	const queued = data.queued === true || phase.includes("queued");
	const consumerStarted = data.consumerStarted === true && isStartPhase(phase);
	return {
		observedAt,
		phase,
		lane,
		queued: consumerStarted ? false : queued,
		consumerStarted,
		keepAliveMs: boundedKeepAlive(data.keepAliveMs),
		laneInflight: nonnegative(laneStats.inflight),
		laneQueued: nonnegative(laneStats.queued),
		maxInflight: nonnegative(laneStats.maxInflight),
		executorBusy: nonnegative(data.queueStats?.filesystemExecutor?.busy),
		executorQueued: nonnegative(data.queueStats?.filesystemExecutor?.queued),
		executorReady: nonnegative(data.queueStats?.filesystemExecutor?.ready)
	};
}

/**
 * Joins new testimony to prior truth without allowing start evidence to regress.
 * @param {object} previous Earlier evidence retained by the request record.
 * @param {object} current Newly observed evidence from the connected generation.
 * @returns {object} The strongest monotonic consumer state with newest telemetry.
 */
function merge(previous = {}, current = {}) {
	const consumerStarted = previous.consumerStarted === true || current.consumerStarted === true;
	return {
		...previous,
		...current,
		consumerStarted,
		queued: consumerStarted ? false : current.queued === true,
		keepAliveMs: current.keepAliveMs || previous.keepAliveMs || 0
	};
}

/** Returns the bounded interval needed to hear the next truthful queue heartbeat. */
function queueWatchdogMs(evidence = {}, staleMs = 15000) {
	const base = boundedStale(staleMs);
	if (evidence.queued !== true || !evidence.keepAliveMs) return base;
	const margin = Math.max(1000, Math.min(10000, Math.ceil(evidence.keepAliveMs * 0.2)));
	return Math.min(MAX_QUEUE_WATCHDOG_MS, Math.max(base, evidence.keepAliveMs + margin));
}

/** Defers only genuinely queued work while independent live capacity still exists. */
function shouldDefer(evidence = {}, now = Date.now(), staleMs = 15000) {
	if (evidence.consumerStarted === true || evidence.queued !== true) return false;
	const liveCapacity = Number(evidence.laneInflight || 0) > 0
		|| Number(evidence.executorBusy || 0) > 0;
	if (!liveCapacity) return false;
	const ageMs = Math.max(0, now - Number(evidence.observedAt || 0));
	return ageMs <= queueWatchdogMs(evidence, staleMs);
}

/** Accepts explicit admission and later phases that can only occur after admission. */
function isStartPhase(phase = "") {
	const value = String(phase);
	return START_PHASES.has(value)
		|| RUNNING_PHASES.has(value)
		|| value.endsWith("_handler_started");
}

function boundedKeepAlive(value) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) return 0;
	return Math.max(1000, Math.min(MAX_QUEUE_WATCHDOG_MS - 1000, Math.floor(number)));
}

function boundedStale(value) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(MAX_QUEUE_WATCHDOG_MS, Math.floor(number)))
		: 15000;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = {
	MAX_QUEUE_WATCHDOG_MS,
	RUNNING_PHASES,
	START_PHASES,
	boundedKeepAlive,
	isStartPhase,
	merge,
	nonnegative,
	observe,
	queueWatchdogMs,
	shouldDefer
};
