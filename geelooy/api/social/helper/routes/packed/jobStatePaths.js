//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobStatePaths.js
 * @description
 * The Awtsmoos gives every durable import state one rooted vessel of light;
 * Awtsmoos.com resolves the database once, so every guarded path agrees on where truth must write.
 */

const path = require('node:path');

const DEFAULT_DB_ROOT = '/mnt/HC_Volume_102267213/dayuhChadash';

/** Resolve the canonical database root used by packed import state. */
function databaseRoot($i) {
	return $i?.db?.directory
		|| $i?.db?.root
		|| process.env.AWTSMOOS_DBROOT
		|| DEFAULT_DB_ROOT;
}

/** Resolve the packed import job-state directory for a request context. */
function jobStateDir($i) {
	return path.join(databaseRoot($i), 'socialPacked', 'post-import-jobs');
}

/** Accept only server-style job ids before any filesystem operation. */
function safeJobId(id) {
	if (typeof id !== 'string' || !id || id.length > 128) return null;
	if (!/^[A-Za-z0-9_-]+$/.test(id)) return null;
	return id;
}

/** Return the canonical JSON filename, or null for an invalid id. */
function jobStatePath($i, id) {
	const safe = safeJobId(id);
	return safe ? path.join(jobStateDir($i), safe + '.json') : null;
}

module.exports = {
	DEFAULT_DB_ROOT,
	databaseRoot,
	jobStateDir,
	jobStatePath,
	safeJobId
};
