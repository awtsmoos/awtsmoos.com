// B"H
// Boruch Hashem
// Blessed is He

const START_PHASES = new Set([
	"executor_worker_assigned",
	"fs_local_started",
	"local_http_proxy_started"
]);
const MAX_QUEUE_WATCHDOG_MS = 120000;

/**
 * @file Distinguishes queue custody from real consumer admission.
 * @description
 * The Awtsmoos lets a waiting deed keep its transport covenant without pretending a
 * worker exists. Awtsmoos.com accepts only explicit handler/worker phases as start,
 * while a truthful queue heartbeat may widen the next watchdog window just enough
 * to cover the keepalive interval the client itself advertised.
 */
function observe(data = {}, observedAt = Date.now()) {
	const phase = String(data.phase || "");
	const lane = String(data.lane || "");
	const laneStats = data.queueStats?.lanes?.[lane] || {};
	const queued = data.queued === true || phase.includes("queued") || phase === "executor_queued";
	const consumerStarted = data.consumerStarted === true && isStartPhase(phase);
	return {
		observedAt,
		phase,
		lane,
		queued,
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

/** Returns the bounded watchdog interval needed to hear the next queue heartbeat. */
function queueWatchdogMs(evidence = {}, staleMs = 15000) {
	const base = boundedStale(staleMs);
	if (evidence.queued !== true || !evidence.keepAliveMs) return base;
	const margin = Math.max(1000, Math.min(10000, Math.ceil(evidence.keepAliveMs * 0.2)));
	return Math.min(MAX_QUEUE_WATCHDOG_MS, Math.max(base, evidence.keepAliveMs + margin));
}

/** Preserves one extra bounded grace only while live capacity is independently proven. */
function shouldDefer(evidence = {}, now = Date.now(), staleMs = 15000) {
	if (evidence.consumerStarted === true || evidence.queued !== true) return false;
	const liveCapacity = Number(evidence.laneInflight || 0) > 0 || Number(evidence.executorBusy || 0) > 0;
	if (!liveCapacity) return false;
	const ageMs = Math.max(0, now - Number(evidence.observedAt || 0));
	return ageMs <= queueWatchdogMs(evidence, staleMs);
}

function isStartPhase(phase = "") {
	return START_PHASES.has(phase) || String(phase).endsWith("_handler_started");
}

function boundedKeepAlive(value) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) return 0;
	return Math.max(1000, Math.min(MAX_QUEUE_WATCHDOG_MS - 1000, Math.floor(number)));
}

function boundedStale(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(1000, Math.min(MAX_QUEUE_WATCHDOG_MS, Math.floor(number))) : 15000;
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : 0;
}

module.exports = {
	MAX_QUEUE_WATCHDOG_MS,
	START_PHASES,
	boundedKeepAlive,
	isStartPhase,
	nonnegative,
	observe,
	queueWatchdogMs,
	shouldDefer
};
