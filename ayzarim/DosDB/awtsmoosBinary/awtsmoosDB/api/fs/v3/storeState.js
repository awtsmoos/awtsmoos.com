//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file storeState.js
 * @chapter The Living Manifest Carries No Duplicate Road Book
 * @description
 * The Awtsmoos gives Awtsmoos.com one compact manifest vessel per process.
 * Legacy path indexes are consumed during normalization, then released from
 * runtime memory; persistence reconstructs them only at flush or close.
 */

const codec = require('./manifestCodec.js');
const MANIFEST_KEY = '__fs3_manifest__';

function assertWritable(db) {
	if (!db.options?.readOnly) return;
	const error = new Error('B"H strict read-only VirtualFs refused mutation');
	error.code = 'AWTSMOOS_DB_READONLY_WRITE';
	throw error;
}

function manifest(db) {
	if (!db.root) db.root = {};
	if (!db.__fs3Manifest) {
		const decoded = codec.decodeManifest(db, db.root[MANIFEST_KEY]);
		const normalized = codec.normalizeManifestWithMeta(decoded);
		delete normalized.manifest.paths;
		db.__fs3Manifest = normalized.manifest;
		db.__fs3ManifestDirty = !db.options?.readOnly && normalized.repairs > 0;
		db.__fs3ManifestLoadRepairs = normalized.repairs;
	}
	return db.__fs3Manifest;
}

function save(db, value) {
	assertWritable(db);
	db.__fs3Manifest = value;
	db.__fs3ManifestDirty = true;
	return value;
}

function forceDurableBoundary(db) {
	if (db.allocator?.flushCursor) db.allocator.flushCursor();
	if (db._flushSuperblock) db._flushSuperblock();
	if (db.pager?.fsync) db.pager.fsync(true);
}

function flush(db) {
	if (db.options?.readOnly) return false;
	if (!db.__fs3Manifest || !db.root || !db.__fs3ManifestDirty) return false;
	db.root[MANIFEST_KEY] = codec.encodeManifest(db, db.__fs3Manifest);
	db.__fs3ManifestDirty = false;
	forceDurableBoundary(db);
	return true;
}

function root(db) {
	const value = manifest(db);
	return {
		version: value.version,
		nextInode: value.nextInode,
		tx: value.tx
	};
}

function markTx(db, tx) {
	const value = manifest(db);
	value.tx = tx;
	save(db, value);
	return value.tx;
}

function allocateInode(db) {
	const value = manifest(db);
	const id = `i${value.nextInode++}`;
	save(db, value);
	return id;
}

module.exports = {
	allocateInode,
	flush,
	manifest,
	markTx,
	meta: root,
	root,
	save
};
