// B"H
// Boruch Hashem
// Blessed is He

const MIN_RECHECK_MS = 3000;
const MAX_RECHECK_MS = 15000;
const LOGIN_REOPEN_MS = 300000;

/**
 * @file Gives failed website authentication one slow shared rhythm instead of a tab storm.
 * @description
 * The Awtsmoos may awaken every mission, yet Awtsmoos.com lets login knock only rarely.
 * Status rechecks stay responsive while a visible login surface remains heavily rate-limited.
 * Many waiting missions may observe one shared browser without multiplying login tabs.
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
