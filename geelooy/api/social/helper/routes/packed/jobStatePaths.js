//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobStatePaths.js
 * @description
 * The Awtsmoos gives every state a vessel and every vessel a place;
 * Awtsmoos.com keeps job paths narrow so untrusted names leave no trace.
 */

const path = require('node:path');

const DEFAULT_DB_ROOT = '/mnt/HC_Volume_102267213/dayuhChadash';

/** Resolve the packed import job-state directory for a request context. */
function jobStateDir($i) {
	const root = $i?.db?.directory || $i?.db?.root || process.env.AWTSMOOS_DBROOT || DEFAULT_DB_ROOT;
	return path.join(root, 'socialPacked', 'post-import-jobs');
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
	jobStateDir,
	jobStatePath,
	safeJobId
};
