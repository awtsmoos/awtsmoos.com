//B"H
//Blessed is He
//Boruch Hashem

/** @module EventLoopMonitor
 * Continuous event-loop lag probe + load-shed circuit breaker.
 *
 * The 2026-10-20 crashes were NOT OOM kills (kernel log clean) and NOT dead
 * processes — Node was ALIVE but its event loop was starved for 10+ minutes
 * by synchronous disk flush + deflate across 16 parallel import pipelines,
 * so even SIGTERM could not be processed (systemd had to SIGKILL).
 *
 * This monitor measures loop drift every second (setInterval is cheap and
 * unref'd so it never holds the process open). When lag crosses thresholds
 * the import path sheds load: admission rejects new jobs, running workers
 * pause, until the loop breathes again.
 *
 * Thresholds are tuned for a 2 GB box. Do NOT raise them without a
 * measured reason — a drowning loop must shed, not hope.
 *
 * AI SAFEGUARD: this module has NO dependencies (no require cycles) and
 * starts idempotently. It is started once from postImportRoutes.js.
 */

/** @constant {number} Probe interval, ms. */
const PROBE_MS = 1000;
/** @constant {number} Ring buffer size for lag samples. */
const SAMPLES_MAX = 60;
/** @constant {number} p95 lag above which the loop counts as blocked. */
const BLOCKED_P95_MS = 2000;
/** @constant {number} Mean of last-10 above which the circuit opens. */
const CIRCUIT_MEAN_MS = 3000;
/** @constant {number} p95 lag above which the circuit opens outright. */
const CIRCUIT_P95_MS = 5000;

/** @type {number[]} */
const samples = [];
/** @type {boolean} */
let started = false;
/** @type {number} */
let lastTick = 0;

/**
 * Record one lag sample into the ring buffer.
 * @param {number} lagMs
 */
function pushSample(lagMs) {
	samples.push(lagMs);
	if (samples.length > SAMPLES_MAX) samples.shift();
}
/**
 * Start the 1s drift probe. Safe to call many times (first wins).
 */
function startEventLoopMonitor() {
	if (started) return;
	started = true;
	lastTick = Date.now();
	const timer = setInterval(() => {
		const now = Date.now();
		const drift = now - lastTick - PROBE_MS;
		lastTick = now;
		pushSample(Math.max(0, drift));
	}, PROBE_MS);
	if (typeof timer.unref === 'function') timer.unref();
}

/**
 * p95 of the recorded lag samples (0 when cold).
 * @returns {number}
 */
function loopLagP95() {
	if (!samples.length) return 0;
	const sorted = [...samples].sort((a, b) => a - b);
	return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
}

/**
 * Mean of the last N samples (0 when cold).
 * @param {number} n
 * @returns {number}
 */
function loopLagMean(n) {
	if (!samples.length) return 0;
	const tail = samples.slice(-n);
	return tail.reduce((a, b) => a + b, 0) / tail.length;
}

/**
 * True when the loop is currently drowning (p95 lag > 2s).
 * Workers should pause; admission should reject.
 * @returns {boolean}
 */
function loopBlocked() {
	return loopLagP95() > BLOCKED_P95_MS;
}

/**
 * Load-shed circuit: true when lag is catastrophic (mean-of-10 > 3s
 * or p95 > 5s). Stays cheap and self-recovering — closes on its own
 * as soon as samples normalize.
 * @returns {boolean}
 */
function circuitOpen() {
	if (!samples.length) return false;
	return loopLagMean(10) > CIRCUIT_MEAN_MS || loopLagP95() > CIRCUIT_P95_MS;
}

/**
 * Single predicate for hot paths: shed load NOW if blocked or open.
 * @returns {boolean}
 */
function shedNow() {
	return loopBlocked() || circuitOpen();
}

module.exports = {
	startEventLoopMonitor, loopLagP95, loopLagMean,
	loopBlocked, circuitOpen, shedNow,
	BLOCKED_P95_MS, CIRCUIT_MEAN_MS, CIRCUIT_P95_MS
};
