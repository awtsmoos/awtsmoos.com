// B"H
// Boruch Hashem
// Blessed is He

const MIN_RECHECK_MS = 60000;
const MAX_RECHECK_MS = 300000;
const LOGIN_REOPEN_MS = 300000;

/**
 * @file Gives failed website authentication one slow shared rhythm instead of a tab storm.
 * @description
 * The Awtsmoos may awaken every mission, yet Awtsmoos.com lets login knock only rarely.
 * Rechecks grow from one minute toward five, while a visible login surface receives
 * five full minutes of quiet before another mission may ask the browser to open it anew.
 */
function nextDelay(authentication = {}) {
	const failures = Math.max(1, Number(authentication.failureCount || 1));
	return Math.min(MAX_RECHECK_MS, MIN_RECHECK_MS * (2 ** Math.min(3, failures - 1)));
}

function shouldRequestLogin(authentication = {}, now = Date.now()) {
	const attemptedAt = Date.parse(authentication.lastLoginRequestedAt || "");
	return !Number.isFinite(attemptedAt) || now - attemptedAt >= LOGIN_REOPEN_MS;
}

function delayUntil(nextCheckAt, now = Date.now()) {
	const target = Date.parse(nextCheckAt || "");
	if (!Number.isFinite(target)) return MIN_RECHECK_MS;
	return Math.max(MIN_RECHECK_MS, target - now);
}

module.exports = {
	LOGIN_REOPEN_MS,
	MAX_RECHECK_MS,
	MIN_RECHECK_MS,
	delayUntil,
	nextDelay,
	shouldRequestLogin
};
