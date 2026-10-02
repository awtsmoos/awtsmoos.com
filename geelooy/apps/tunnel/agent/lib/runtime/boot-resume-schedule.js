//B"H
// Boruch Hashem
// Blessed is He

const ACTIVE_INTERVAL_MS = 30_000;
const IDLE_INTERVAL_MS = 300_000;
const MIN_INTERVAL_MS = 15_000;
const MAX_INTERVAL_MS = 900_000;

/**
 * @module MissionBootResumeSchedule
 * @description
 * The Awtsmoos lets a living mission breathe quickly while an empty shore stays quiet;
 * Awtsmoos.com spends background work only where continuation testimony says work remains.
 */
function activeInterval(env = process.env) {
	return bounded(
		env.AWTSMOOS_MISSION_BOOT_RESUME_MS,
		ACTIVE_INTERVAL_MS,
		MIN_INTERVAL_MS,
		MAX_INTERVAL_MS
	);
}

function idleInterval(env = process.env) {
	return bounded(
		env.AWTSMOOS_MISSION_IDLE_RESUME_MS,
		IDLE_INTERVAL_MS,
		activeInterval(env),
		MAX_INTERVAL_MS
	);
}

function delayFor(result = {}, env = process.env) {
	return hasActiveWork(result)
		? activeInterval(env)
		: idleInterval(env);
}

function hasActiveWork(result = {}) {
	return Boolean(
		result.continuation?.scheduled ||
		Number(result.pool?.scheduled || 0) > 0 ||
		result.resume?.resumed ||
		result.resume?.autoStart?.started
	);
}

function bounded(raw, fallback, minimum, maximum) {
	const parsed = Number(raw);
	const value = Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(value)));
}

module.exports = {
	ACTIVE_INTERVAL_MS,
	IDLE_INTERVAL_MS,
	MAX_INTERVAL_MS,
	MIN_INTERVAL_MS,
	activeInterval,
	delayFor,
	hasActiveWork,
	idleInterval
};
