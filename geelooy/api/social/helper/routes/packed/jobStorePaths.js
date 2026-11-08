//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobStorePaths.js
 * @description
 * Bulk-upload redesign §3.3: the import job store lives OFF the data
 * volume, so a job can always be RECORDED even when the data disk is
 * below its 8 GiB floor. Primary: /var/lib/awtsmoos/import-jobs on the
 * root filesystem (sda1, 18 GiB free Nov 6, 2026). Fallback: the legacy
 * <dbRoot>/socialPacked/post-import-jobs directory, used when the
 * primary cannot be created or written — a job recorded degraded is
 * still a job, and the refusal only happens when BOTH fail.
 *
 * Non-production database roots (tests, staging) keep the legacy
 * colocated directory: the separation exists to protect the production
 * data volume, not to scatter test state across the machine. An explicit
 * AWTSMOOS_IMPORT_JOB_STORE override wins everywhere (ops + tests).
 */

const fs = require('node:fs');
const path = require('node:path');
const { databaseRoot } = require('./jobStatePaths.js');

const DEFAULT_JOB_STORE_ROOT = '/var/lib/awtsmoos/import-jobs';
const PRODUCTION_DB_ROOT = '/mnt/HC_Volume_102267213/dayuhChadash';
const JOB_STORE_FLOOR_BYTES = 500 * 1024 * 1024; // 500 MB on the job-store volume

let cachedPrimaryUsable = null;

/** The legacy job-state directory under the database root. */
function legacyJobStateDir($i) {
	return path.join(databaseRoot($i), 'socialPacked', 'post-import-jobs');
}

/** True when the request context points at the production database. */
function isProductionRoot($i) {
	const root = databaseRoot($i);
	return !root || root === PRODUCTION_DB_ROOT;
}

/** Probe once per process whether the primary store can be created. */
function primaryUsable() {
	if (cachedPrimaryUsable !== null) return cachedPrimaryUsable;
	const override = process.env.AWTSMOOS_IMPORT_JOB_STORE;
	const target = override || DEFAULT_JOB_STORE_ROOT;
	try {
		fs.mkdirSync(target, { recursive: true });
		fs.accessSync(target, fs.constants.W_OK);
		cachedPrimaryUsable = true;
	} catch (_) {
		cachedPrimaryUsable = false;
	}
	return cachedPrimaryUsable;
}

/** Forget the cached probe (tests only; production callers never use this). */
function resetJobStoreProbeForTest() {
	cachedPrimaryUsable = null;
	cachedResolve = null;
	cachedResolveKey = null;
}

let cachedResolve = null;
let cachedResolveKey = null;

/**
 * Resolve the job-store root for a request context.
 * Returns { root, degraded, reason } — degraded is true when the primary
 * could not be used and the legacy directory is serving instead.
 * The resolution is cached per (override, db root): it mkdirs the root,
 * and it is called on EVERY receipt append and state save, so an
 * uncached resolution paid a mkdirSync + accessSync per post (measured
 * Nov 8: 100 mkdirSync calls for 100 appends). The write paths still
 * create their own directories on ENOENT, so a root deleted mid-process
 * self-heals on the next write; the cache only chooses WHICH root.
 */
function resolveJobStoreRoot($i) {
	const override = process.env.AWTSMOOS_IMPORT_JOB_STORE;
	const key = (override || '') + '|' + String(databaseRoot($i) || '');
	if (cachedResolve && cachedResolveKey === key) return cachedResolve;
	const resolved = resolveJobStoreRootUncached($i);
	cachedResolve = resolved;
	cachedResolveKey = key;
	return resolved;
}

function resolveJobStoreRootUncached($i) {
	const override = process.env.AWTSMOOS_IMPORT_JOB_STORE;
	if (override) {
		try {
			fs.mkdirSync(override, { recursive: true });
			fs.accessSync(override, fs.constants.W_OK);
			return { root: override, degraded: false, reason: null };
		} catch (error) {
			return { root: legacyJobStateDir($i), degraded: true, reason: String((error && error.message) || error) };
		}
	}
	if (!isProductionRoot($i)) {
		return { root: legacyJobStateDir($i), degraded: false, reason: null };
	}
	if (primaryUsable()) {
		return { root: DEFAULT_JOB_STORE_ROOT, degraded: false, reason: null };
	}
	return { root: legacyJobStateDir($i), degraded: true, reason: 'primary job store ' + DEFAULT_JOB_STORE_ROOT + ' is not writable' };
}

/** All directories a job state may live in, primary first. */
function jobStoreDirs($i) {
	const { root } = resolveJobStoreRoot($i);
	const legacy = legacyJobStateDir($i);
	return root === legacy ? [root] : [root, legacy];
}

/** The directory new job states are written to. */
function jobStateDir($i) {
	return resolveJobStoreRoot($i).root;
}

/** Canonical state filename inside a given store directory. */
function jobStatePathForDir(dir, id) {
	return path.join(dir, id + '.json');
}

/** Canonical per-job receipts filename inside a given store directory. */
function receiptsPathForDir(dir, id) {
	return path.join(dir, id + '.receipts.jsonl');
}

module.exports = {
	DEFAULT_JOB_STORE_ROOT,
	JOB_STORE_FLOOR_BYTES,
	PRODUCTION_DB_ROOT,
	isProductionRoot,
	jobStateDir,
	jobStatePathForDir,
	jobStoreDirs,
	legacyJobStateDir,
	primaryUsable,
	receiptsPathForDir,
	resetJobStoreProbeForTest,
	resolveJobStoreRoot
};
