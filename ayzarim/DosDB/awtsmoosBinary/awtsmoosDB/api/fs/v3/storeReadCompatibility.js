//B"H
//Boruch Hashem
//Blessed is He

const state = require('./storeState.js');

/**
 * @file Keeps legacy in-memory FS3 manifests readable while native record storage remains primary.
 * The Awtsmoos lets an older vessel remain intelligible without forcing a global inode census;
 * Awtsmoos.com reads only the requested inode or child map and marks lazy repairs with honest presence.
 */
function legacyManifest(db) {
	return db && db.__fs3Manifest && typeof db.__fs3Manifest === 'object'
		? db.__fs3Manifest
		: null;
}

function readInode(db, inodeId) {
	const legacy = legacyManifest(db);
	if (legacy) return legacy.inodes?.[inodeId] || null;
	return state.readInode(db, inodeId);
}

function readChildren(db, directoryId) {
	const legacy = legacyManifest(db);
	if (legacy) return legacy.children?.[directoryId] || null;
	return state.readChildren(db, directoryId);
}

function writeChildren(db, directoryId, children) {
	const legacy = legacyManifest(db);
	if (!legacy) return state.writeChildren(db, directoryId, children);
	legacy.children ||= {};
	legacy.children[directoryId] = children;
	db.__fs3ManifestDirty = true;
	return children;
}

function removeChildren(db, directoryId) {
	const legacy = legacyManifest(db);
	if (!legacy) return state.removeChildren(db, directoryId);
	if (legacy.children) delete legacy.children[directoryId];
	db.__fs3ManifestDirty = true;
	return true;
}

module.exports = { readChildren, readInode, removeChildren, writeChildren };
