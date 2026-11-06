//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobStatePaths.js
 * @description
 * The Awtsmoos gives every durable import state one rooted vessel of light;
 * Awtsmoos.com resolves the database once, so every guarded path agrees on where truth must write.
 *
 * Bulk-upload redesign §3.3: the job-state directory itself now resolves
 * through jobStorePaths — OFF the data volume on production
 * (/var/lib/awtsmoos/import-jobs), with the legacy
 * <dbRoot>/socialPacked/post-import-jobs directory as fallback and as
 * the home for non-production database roots. Existing states are read
 * from either directory (primary first); new states are written to the
 * resolved primary.
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

/** The legacy job-state directory under the database root. */
function legacyJobStateDir($i) {
	return path.join(databaseRoot($i), 'socialPacked', 'post-import-jobs');
}

/** Resolve the packed import job-state directory for a request context. */
function jobStateDir($i) {
	try {
		return require('./jobStorePaths.js').jobStateDir($i);
	} catch (_) {
		return legacyJobStateDir($i);
	}
}

/** Every directory a job state may live in, primary first. */
function jobStateDirs($i) {
	try {
		return require('./jobStorePaths.js').jobStoreDirs($i);
	} catch (_) {
		return [legacyJobStateDir($i)];
	}
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

/** Return the JSON filename inside one explicit store directory, or null. */
function jobStatePathForDir(dir, id) {
	const safe = safeJobId(id);
	return safe ? path.join(dir, safe + '.json') : null;
}

module.exports = {
	DEFAULT_DB_ROOT,
	databaseRoot,
	jobStateDir,
	jobStateDirs,
	jobStatePath,
	jobStatePathForDir,
	legacyJobStateDir,
	safeJobId
};
