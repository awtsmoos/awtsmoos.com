//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module PackedStoreGuard
 * @description Store constants and legacy/oversize guards (split from PackedStore.js, verbatim).
 *
 * Size policy (write-path patch P2): MAX_IMPLICIT_STORE_BYTES is an
 * ADVISORY threshold, not a refusal line. The store grows by normal
 * operation (production's live store is ~2.50 GiB), so a hard refusal at
 * 1 GiB turned ordinary growth into a total comments outage that only an
 * env bypass (AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION=true) kept at bay.
 * Oversized implicit opens are therefore ALLOWED, with one loud warning
 * per file (size + guidance). Operators who truly want a hard cap set
 * AWTSMOOS_RICH_STORE_HARD_LIMIT_GIB to a positive number of GiB; only
 * then does an open past that cap throw. An unset/invalid/non-positive
 * value means "no hard cap" — a typo can never recreate the cliff.
 * opts.allowOversizedStore (and the legacy-migration env bypass) still
 * work: they now merely silence the warning for approved opens.
 * The legacy-manifest refusal (refuseImplicitLegacyMigration) is a
 * FORMAT-safety check and is unchanged.
 */

const fs = require('fs');

const FILE = 'social.richComments.v1.fs.awtsdb';

const META_KEY = '__fs3_manifest_meta__';
const LEGACY_MANIFEST_KEY = '__fs3_manifest__';
const MAX_IMPLICIT_STORE_BYTES = 1024 * 1024 * 1024;

function legacyMigrationAllowed() {
	return process.env.AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION === 'true';
}

// Hard cap in bytes from AWTSMOOS_RICH_STORE_HARD_LIMIT_GIB, or null when
// no hard cap is configured (the default). Invalid values mean no cap.
function oversizedStoreHardLimitBytes() {
	const raw = process.env.AWTSMOOS_RICH_STORE_HARD_LIMIT_GIB;
	if (raw === undefined || raw === '') return null;
	const gib = Number.parseFloat(raw);
	if (!Number.isFinite(gib) || gib <= 0) return null;
	return Math.floor(gib * MAX_IMPLICIT_STORE_BYTES);
}

// Files that already produced the oversized warning in this process:
// the warning is loud exactly once per file, never per open.
const warnedOversizedFiles = new Set();

function warnOversizedStoreOnce(file, bytes) {
	if (warnedOversizedFiles.has(file)) return;
	warnedOversizedFiles.add(file);
	const gib = (bytes / MAX_IMPLICIT_STORE_BYTES).toFixed(2);
	console.warn(
		'B"H WARNING: rich-comment store is oversized (' + gib + ' GiB, advisory threshold ' +
		(MAX_IMPLICIT_STORE_BYTES / (1024 * 1024 * 1024)) + ' GiB) and is being opened anyway: ' + file + '. ' +
		'This is allowed by policy — a store grows past any fixed line in normal operation, so size alone ' +
		'never refuses an open. Plan capacity/compaction for this file; to enforce a hard cap instead, set ' +
		'AWTSMOOS_RICH_STORE_HARD_LIMIT_GIB to a positive number of GiB.'
	);
}

function refuseOversizedImplicitStore(file, opts = {}) {
	if (!fs.existsSync(file)) return;
	const bytes = fs.statSync(file).size;
	// Explicit hard cap (opt-in via env): the ONLY size-based refusal.
	const hardLimit = oversizedStoreHardLimitBytes();
	if (hardLimit !== null && bytes > hardLimit) {
		const error = new Error('B"H rich-comment store exceeds the configured hard limit (' +
			(bytes / MAX_IMPLICIT_STORE_BYTES).toFixed(2) + ' GiB > ' +
			(hardLimit / MAX_IMPLICIT_STORE_BYTES).toFixed(2) + ' GiB from AWTSMOOS_RICH_STORE_HARD_LIMIT_GIB): ' + file);
		error.code = 'RICH_COMMENTS_STORE_HARD_LIMIT_EXCEEDED';
		error.bytes = bytes;
		error.limitBytes = hardLimit;
		throw error;
	}
	if (bytes <= MAX_IMPLICIT_STORE_BYTES) return;
	// Explicit per-operation approval (e.g. the publishAll bulk path passes
	// {allowOversizedStore:true}) and the process-wide legacy bypass both
	// silence the advisory warning; neither is required to open the store.
	if (opts.allowOversizedStore || legacyMigrationAllowed()) return;
	warnOversizedStoreOnce(file, bytes);
}

function refuseImplicitLegacyMigration(db, file) {
	if (legacyMigrationAllowed()) return;
	const meta = db.root && db.root[META_KEY];
	const legacy = db.root && db.root[LEGACY_MANIFEST_KEY];
	if (meta || !legacy) return;
	const error = new Error('B"H rich-comment store requires explicit offline FS3 migration: ' + file);
	error.code = 'RICH_COMMENTS_LEGACY_MIGRATION_REQUIRED';
	throw error;
}

module.exports = {
	FILE,
	META_KEY,
	LEGACY_MANIFEST_KEY,
	MAX_IMPLICIT_STORE_BYTES,
	legacyMigrationAllowed,
	oversizedStoreHardLimitBytes,
	refuseOversizedImplicitStore,
	refuseImplicitLegacyMigration,
	// Test/ops hook: forget which files already warned (warning is
	// once-per-file per process by design).
	resetOversizedStoreWarnings() { warnedOversizedFiles.clear(); },
};
