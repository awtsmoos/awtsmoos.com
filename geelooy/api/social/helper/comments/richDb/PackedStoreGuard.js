//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module PackedStoreGuard
 * @description Store constants and legacy/oversize guards (split from PackedStore.js, verbatim).
 */

const fs = require('fs');

const FILE = 'social.richComments.v1.fs.awtsdb';

const META_KEY = '__fs3_manifest_meta__';
const LEGACY_MANIFEST_KEY = '__fs3_manifest__';
const MAX_IMPLICIT_STORE_BYTES = 1024 * 1024 * 1024;

function legacyMigrationAllowed() {
	return process.env.AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION === 'true';
}

function refuseOversizedImplicitStore(file, opts = {}) {
	// Explicit per-operation approval (e.g. the publishAll bulk path passes
	// {allowOversizedStore:true} with the operator's explicit body flag).
	// This is stricter than the process-wide env bypass: the approval is
	// scoped to the single open() call that carries it.
	if (opts.allowOversizedStore || legacyMigrationAllowed() || !fs.existsSync(file)) return;
	const bytes = fs.statSync(file).size;
	if (bytes <= MAX_IMPLICIT_STORE_BYTES) return;
	const error = new Error('B"H oversized rich-comment store requires explicit migration/readiness approval: ' + file);
	error.code = 'RICH_COMMENTS_LEGACY_MIGRATION_REQUIRED';
	error.bytes = bytes;
	throw error;
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
	refuseOversizedImplicitStore,
	refuseImplicitLegacyMigration,
};
