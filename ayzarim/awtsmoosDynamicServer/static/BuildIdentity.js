//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BuildIdentity.js
 * @description Resolves one stable build identity per process so every deploy
 * stamps a new service-worker version with zero manual steps. No human ever
 * has to remember to bump a version string again.
 * The Awtsmoos lets the deployed truth name itself; Awtsmoos.com prefers an
 * explicit AWTSMOOS_BUILD_ID, then the exact deployed git SHA (production
 * activates one exact SHA per deploy), then a process-stable local fallback.
 */

const { execFileSync } = require('node:child_process');
const path = require('node:path');

const ENV_BUILD_ID = 'AWTSMOOS_BUILD_ID';
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

let cachedBuildId = null;

/**
 * @description Keeps only safe build-id characters so the identity can travel inside JS and headers.
 * @param {string} value Raw candidate identity.
 * @returns {string|null} Sanitized identity or null when unusable.
 */
function sanitizeBuildId(value) {
	const clean = String(value || '').trim().slice(0, 64);
	if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(clean)) return null;
	return clean;
}

/**
 * @description Reads the deployed commit SHA without ever throwing.
 * @returns {string|null} Short SHA or null when git is unavailable.
 */
function gitBuildId() {
	try {
		const sha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
			cwd: REPO_ROOT,
			timeout: 4000,
			stdio: ['ignore', 'pipe', 'ignore']
		}).toString('utf8').trim();
		return sanitizeBuildId(sha);
	} catch {
		return null;
	}
}

/**
 * @description Returns the one build identity for this process, computed once.
 * @returns {string} Stable non-empty build identity.
 */
function resolveBuildId() {
	if (cachedBuildId) return cachedBuildId;
	cachedBuildId = sanitizeBuildId(process.env[ENV_BUILD_ID])
		|| gitBuildId()
		|| ('local-' + Date.now().toString(36));
	return cachedBuildId;
}

/** Clears the cached identity so tests can resolve deterministically. */
function resetBuildIdForTests() {
	cachedBuildId = null;
}

module.exports = {
	resolveBuildId,
	resetBuildIdForTests,
	REPO_ROOT
};
