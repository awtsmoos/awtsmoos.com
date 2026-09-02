// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_INTERVAL_MS = 15000;
const DEFAULT_PING_IDLE_MS = 20000;
const DEFAULT_DEAD_IDLE_MS = 45000;
const DEFAULT_MAX_TIMER_DRIFT_MS = 2000;
const DEFAULT_SCHEDULER_GRACE_MS = 30000;

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

module.exports = {
	DEFAULT_DEAD_IDLE_MS, DEFAULT_INTERVAL_MS, DEFAULT_MAX_TIMER_DRIFT_MS,
	DEFAULT_PING_IDLE_MS, DEFAULT_SCHEDULER_GRACE_MS, bounded, resolve
};
