// B"H

/**
 * @file api/fs/v3/store.js
 * @chapter Reading The Covenant Creates No New Ink
 * @description
 * Holds the in-memory VirtualFs manifest. Loading and normalization are pure;
 * only explicit mutation marks dirty, and strict read-only mode rejects every
 * mutation doorway before a blob or superblock can change.
 */

const { ROOT_INODE } = require('./schema');
const codec = require('./manifestCodec.js');
const MANIFEST_KEY = '__fs3_manifest__';

function writable(db) {
	if (!db.options?.readOnly) return;
	const error = new Error('B"H strict read-only VirtualFs refused mutation');
	error.code = 'AWTSMOOS_DB_READONLY_WRITE';
	throw error;
}

function manifest(db) {
	if (!db.root) db.root = {};
	if (!db.__fs3Manifest) {
		db.__fs3Manifest = codec.normalizeManifest(codec.decodeManifest(db, db.root[MANIFEST_KEY]));
		db.__fs3ManifestDirty = false;
	}
	return db.__fs3Manifest;
}

function save(db, value) {
	writable(db);
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
	if (db.options?.readOnly || !db.__fs3Manifest || !db.root || !db.__fs3ManifestDirty) return false;
	db.root[MANIFEST_KEY] = codec.encodeManifest(db, db.__fs3Manifest);
	db.__fs3ManifestDirty = false;
	forceDurableBoundary(db);
	return true;
}

function root(db) {
	const value = manifest(db);
	return { version: value.version, nextInode: value.nextInode, tx: value.tx };
}

function markTx(db, tx) { const value = manifest(db); value.tx = tx; save(db, value); return value.tx; }
function allocateInode(db) { const value = manifest(db); const id = `i${value.nextInode++}`; save(db, value); return id; }
function getInode(db, id) { const inode = id ? manifest(db).inodes[id] : null; return inode && !inode.deleted ? inode : null; }

function setInode(db, inode) {
	const value = manifest(db);
	value.inodes[inode.id] = inode;
	if (inode.path) value.paths[inode.path] = inode.id;
	if (inode.type === 'dir') value.children[inode.id] ||= {};
	save(db, value);
	return inode;
}

function removeInode(db, id) {
	const value = manifest(db);
	const inode = value.inodes[id];
	if (inode?.path) delete value.paths[inode.path];
	delete value.inodes[id];
	delete value.children[id];
	save(db, value);
}

function pathToInodeId(db, normalizedPath) {
	const value = manifest(db);
	const id = value.paths[normalizedPath];
	return id && value.inodes[id] && !value.inodes[id].deleted ? id : null;
}

function pathToInode(db, normalizedPath) { return getInode(db, pathToInodeId(db, normalizedPath)); }
function setPathIndex(db, normalizedPath, inodeId) { const value = manifest(db); value.paths[normalizedPath] = inodeId; save(db, value); return inodeId; }
function removePathIndex(db, normalizedPath) { const value = manifest(db); delete value.paths[normalizedPath]; save(db, value); return true; }

function getChildren(db, directoryId) {
	const value = manifest(db);
	const children = Object.assign({}, value.children[directoryId] || {});
	for (const inode of Object.values(value.inodes)) {
		if (inode && !inode.deleted && inode.parent === directoryId && inode.name) children[inode.name] = inode.id;
	}
	for (const [name, id] of Object.entries(children)) if (!value.inodes[id] || value.inodes[id].deleted) delete children[name];
	if (!db.options?.readOnly) { value.children[directoryId] = children; save(db, value); }
	return children;
}

function setChild(db, directoryId, name, childId) { const value = manifest(db); value.children[directoryId] ||= {}; value.children[directoryId][name] = childId; save(db, value); return childId; }
function removeChild(db, directoryId, name) { const value = manifest(db); value.children[directoryId] ||= {}; delete value.children[directoryId][name]; save(db, value); return true; }
function deleteChildrenMap(db, directoryId) { const value = manifest(db); delete value.children[directoryId]; save(db, value); }
function createDirInode({ db, id, name, parent, path }) { return setInode(db, { id, type: 'dir', name, parent, path, size: 0, ctime: Date.now(), mtime: Date.now(), version: 1, deleted: false }); }
function createFileInode({ db, id, name, parent, path, record }) { return setInode(db, { id, type: 'file', name, parent, path, size: record.size, dataKind: record.kind, data: record.data, ctime: Date.now(), mtime: Date.now(), version: 1, deleted: false }); }

module.exports = { root, meta: root, flush, markTx, allocateInode, getInode, setInode, removeInode, pathToInodeId, pathToInode, setPathIndex, removePathIndex, getChildren, setChild, removeChild, deleteChildrenMap, createDirInode, createFileInode, manifest };
