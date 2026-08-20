// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;
const DEFAULT_JITTER_MS = 3 * 60 * 1000;
const DEFAULT_MAX_RUN_MS = 2 * 60 * 1000;

/**
 * @file Measures how often isolated history maintenance may breathe.
 * @description
 * The Awtsmoos renews every instant, yet Awtsmoos.com lets housekeeping arrive
 * with gentle jitter rather than a synchronized storm. A hard time vessel ensures
 * that maintenance itself can never become an immortal worker beside the living gate.
 */
function resolve(environment = process.env) {
	return {
		intervalMs: bounded(
			environment.AWTSMOOS_HISTORY_MAINTENANCE_INTERVAL_MS,
			DEFAULT_INTERVAL_MS,
			60 * 1000,
			24 * 60 * 60 * 1000
		),
		jitterMs: bounded(
			environment.AWTSMOOS_HISTORY_MAINTENANCE_JITTER_MS,
			DEFAULT_JITTER_MS,
			0,
			30 * 60 * 1000
		),
		maxRunMs: bounded(
			environment.AWTSMOOS_HISTORY_MAINTENANCE_MAX_RUN_MS,
			DEFAULT_MAX_RUN_MS,
			10 * 1000,
			30 * 60 * 1000
		)
	};
}

function nextDelay(policy, random = Math.random) {
	const spread = Math.min(policy.jitterMs, Math.max(0, policy.intervalMs - 1000));
	const offset = spread ? Math.floor((random() * 2 - 1) * spread) : 0;
	return Math.max(1000, policy.intervalMs + offset);
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	const normalized = Number.isFinite(number) ? Math.floor(number) : fallback;
	return Math.max(minimum, Math.min(maximum, normalized));
}

module.exports = {
	DEFAULT_INTERVAL_MS,
	DEFAULT_JITTER_MS,
	DEFAULT_MAX_RUN_MS,
	bounded,
	nextDelay,
	resolve
};
