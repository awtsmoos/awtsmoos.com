// B"H
// Boruch Hashem
// Blessed is He

const History = require("./transportFailureHistory.js");
const Monotonic = require("../runtime/monotonic.js");

const DEFAULT_INTERVAL_MS = 15000;
const DEFAULT_PING_IDLE_MS = 20000;
const DEFAULT_DEAD_IDLE_MS = 45000;
const DEFAULT_MAX_TIMER_DRIFT_MS = 2000;
const DEFAULT_SCHEDULER_GRACE_MS = 30000;

// B9: bounds for flap-cadence adaptation of the death threshold.
const MIN_ADAPT_SAMPLES = 4;
const ADAPT_PRESSURE_GATE = 0.5;
const ADAPT_MAX_DEAD_IDLE_MS = 180000;
const QUIET_PERIOD_MULTIPLE = 3;

/**
 * @file Resolves bounded remote-silence timing and a separate local scheduler grace.
 * @description
 * The Awtsmoos gives network silence and local suspension different measures; Awtsmoos.com
 * may delay a verdict when its own clock slept, but the grace remains chained to the last
 * genuine inbound testimony and can never become fabricated remote life.
 */
function resolve(options = {}, environment = process.env) {
	const intervalMs = bounded(
		options.intervalMs ?? environment.AWTSMOOS_WS_LIVENESS_INTERVAL_MS,
		1000, 60000, DEFAULT_INTERVAL_MS
	);
	const pingIdleMs = bounded(
		options.pingIdleMs ?? environment.AWTSMOOS_WS_PING_IDLE_MS,
		intervalMs, 300000, DEFAULT_PING_IDLE_MS
	);
	const deadIdleMs = bounded(
		options.deadIdleMs ?? environment.AWTSMOOS_WS_DEAD_IDLE_MS,
		pingIdleMs + intervalMs, 900000, DEFAULT_DEAD_IDLE_MS
	);
	const maxTimerDriftMs = bounded(
		options.maxTimerDriftMs ?? environment.AWTSMOOS_WS_MAX_TIMER_DRIFT_MS,
		250, deadIdleMs, DEFAULT_MAX_TIMER_DRIFT_MS
	);
	const schedulerGraceMs = bounded(
		options.schedulerGraceMs ?? environment.AWTSMOOS_WS_SCHEDULER_GRACE_MS,
		intervalMs, deadIdleMs, Math.min(DEFAULT_SCHEDULER_GRACE_MS, deadIdleMs)
	);
	return { deadIdleMs, intervalMs, maxTimerDriftMs, pingIdleMs, schedulerGraceMs };
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return Math.max(minimum, Math.min(maximum, fallback));
	}
	return Math.max(minimum, Math.min(maximum, Math.floor(number)));
}

/**
 * B9: adapts the missed-heartbeat death threshold to the observed relay flap
 * cadence, within safe bounds.
 *
 * - Sparse history (< 4 failures) or unmeasurable cadence: defaults unchanged
 *   (never looser under genuinely novel conditions).
 * - Quiet period (no failures for 3x the base death threshold): decays back to
 *   the base defaults.
 * - Low flap pressure (median cadence comfortably above the threshold): defaults.
 * - High flap pressure (frequent short flaps): widens deadIdleMs proportionally
 *   to the pressure, capped at 2x base and 180s, and NEVER below the base —
 *   shortening the threshold during a real flap storm risks false deaths.
 *
 * Returns the resolved settings plus an `adaptive` report
 * { active, reason, samples, medianIntervalMs, pressure, domain }.
 * `now` is injectable for tests; it must share the cadence domain (monotonic
 * when the cadence rode atMono, wall-clock otherwise).
 */
function adaptive(history = [], options = {}, environment = process.env, now) {
	const base = resolve(options, environment);
	const flap = History.cadence(history);
	const info = {
		active: false,
		reason: "insufficient_samples",
		samples: flap.samples,
		medianIntervalMs: flap.medianIntervalMs,
		pressure: 0,
		domain: flap.domain
	};
	if (flap.samples < MIN_ADAPT_SAMPLES || !(flap.medianIntervalMs > 0)) {
		return { ...base, adaptive: info };
	}
	const clock = typeof now === "function"
		? now
		: flap.domain === "mono" ? Monotonic.monotonicMs : Date.now;
	if (flap.lastAtMs > 0 &&
		clock() - flap.lastAtMs > QUIET_PERIOD_MULTIPLE * base.deadIdleMs) {
		info.reason = "quiet_period";
		return { ...base, adaptive: info };
	}
	const pressure = Math.max(0, Math.min(1, base.deadIdleMs / flap.medianIntervalMs));
	info.pressure = pressure;
	if (pressure <= ADAPT_PRESSURE_GATE) {
		info.reason = "low_pressure";
		return { ...base, adaptive: info };
	}
	const widened = Math.round(base.deadIdleMs * (1 + pressure));
	const adapted = Math.min(
		ADAPT_MAX_DEAD_IDLE_MS,
		2 * base.deadIdleMs,
		Math.max(base.deadIdleMs, widened)
	);
	info.active = true;
	info.reason = "flap_pressure";
	info.adaptedDeadIdleMs = adapted;
	return { ...base, deadIdleMs: adapted, adaptive: info };
}

module.exports = {
	DEFAULT_DEAD_IDLE_MS, DEFAULT_INTERVAL_MS, DEFAULT_MAX_TIMER_DRIFT_MS,
	DEFAULT_PING_IDLE_MS, DEFAULT_SCHEDULER_GRACE_MS,
	ADAPT_MAX_DEAD_IDLE_MS, MIN_ADAPT_SAMPLES,
	adaptive, bounded, resolve
};
