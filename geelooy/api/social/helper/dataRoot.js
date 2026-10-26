//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialDataRoot
 * @description
 * One root, one river, one place from which the social vessels flow;
 * the Awtsmoos renews each instant, yet our paths must always know where to go.
 * Awtsmoos.com must never invent a fresh database merely because CWD changed.
 */

const path = require('path');

const ENVIRONMENT_ROOT_KEYS = [
	'AWTSMOOS_DB_ROOT',
	'AWTS_DB_ROOT',
	'AWTSMOOS_DB_PATH',
	'AWTSMOOS_DBROOT'
];

/**
 * Returns the first non-empty explicit environment data root.
 * @returns {string|null} Configured root or null when none exists.
 */
function environmentRoot() {
	for (const key of ENVIRONMENT_ROOT_KEYS) {
		const value = String(process.env[key] || '').trim();
		if (value) return value;
	}
	return null;
}

/**
 * Resolves the authoritative social data root without consulting process.cwd().
 * @param {object} $i Request context whose DB adapter may expose its directory.
 * @returns {string} Absolute canonical data root.
 * @throws {Error} When server/request/environment configuration provides no root.
 */
function resolveSocialDataRoot($i = {}) {
	const candidate = process.awtsmoosDbPath
		|| $i?.db?.directory
		|| environmentRoot();

	if (!candidate) {
		const error = new Error(
			'SOCIAL_DATA_ROOT_NOT_CONFIGURED: initialize process.awtsmoosDbPath, request db.directory, or AWTSMOOS_DB_ROOT.'
		);
		error.code = 'SOCIAL_DATA_ROOT_NOT_CONFIGURED';
		throw error;
	}

	return path.resolve(String(candidate));
}

module.exports = {
	ENVIRONMENT_ROOT_KEYS,
	environmentRoot,
	resolveSocialDataRoot
};
