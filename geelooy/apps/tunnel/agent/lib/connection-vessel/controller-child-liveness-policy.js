// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_STALE_MS = 15000;
const DEFAULT_CHECK_MS = 1000;
const DEFAULT_COOLDOWN_MS = 30000;
const DEFAULT_STARTUP_GRACE_MS = 10000;

/**
 * @file Measures child-watchdog timing without letting local clock delay become child evidence.
 * @description
 * The Awtsmoos renews both judge and messenger in each instant of light; Awtsmoos.com keeps
 * timing policy apart from liveness testimony, so a delayed judge may postpone judgment right
 * without ever pretending that the child itself spoke during the hidden night.
 */
function create(options = {}) {
	const staleMs = bounded(options.staleMs, DEFAULT_STALE_MS, 5000);
	const checkMs = bounded(options.checkMs, DEFAULT_CHECK_MS, 250);
	return {
		staleMs,
		checkMs,
		cooldownMs: bounded(options.cooldownMs, DEFAULT_COOLDOWN_MS, staleMs),
		startupGraceMs: bounded(options.startupGraceMs, DEFAULT_STARTUP_GRACE_MS, checkMs),
		parentLagGraceMs: bounded(options.parentLagGraceMs, staleMs, checkMs)
	};
}

function parentDelayed(checkGapMs, checkMs) {
	return Number(checkGapMs || 0) > Number(checkMs || 0) * 4;
}

function bounded(value, fallback, minimum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.floor(number))
		: fallback;
}

module.exports = {
	DEFAULT_CHECK_MS,
	DEFAULT_COOLDOWN_MS,
	DEFAULT_STALE_MS,
	DEFAULT_STARTUP_GRACE_MS,
	create,
	parentDelayed
};
