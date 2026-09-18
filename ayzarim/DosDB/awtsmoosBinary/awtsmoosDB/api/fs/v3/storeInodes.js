//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file storeInodes.js
 * @chapter Every Road Is Found Through Its Living Doors
 * @description
 * The Awtsmoos lets Awtsmoos.com resolve FS3 paths through the already-live
 * directory child graph. No second full-path hash table remains in memory, yet
 * inode path metadata still preserves v3 persistence and move semantics.
 */

const state = require('./storeState.js');
const pathTools = require('./path.js');
const { ROOT_INODE } = require('./schema.js');

function getInode(db, id) {
	const inode = id ? state.manifest(db).inodes[id] : null;
	return inode && !inode.deleted ? inode : null;
}

function setInode(db, inode) {
	const value = state.manifest(db);
	value.inodes[inode.id] = inode;
	if (inode.type === 'dir') value.children[inode.id] ||= {};
	state.save(db, value);
	return inode;
}

function removeInode(db, id) {
	const value = state.manifest(db);
	delete value.inodes[id];
	delete value.children[id];
	state.save(db, value);
}

function childAt(value, parentId, name) {
	const childId = value.children[parentId]?.[name];
	if (!childId) return null;
	const inode = value.inodes[childId];
	if (!inode || inode.deleted) return null;
	if (inode.parent !== parentId || inode.name !== name) return null;
	return childId;
}

function pathToInodeId(db, requestedPath) {
	const value = state.manifest(db);
	const normalizedPath = pathTools.normalize('/', requestedPath);
	if (normalizedPath === '/') return getInode(db, ROOT_INODE) ? ROOT_INODE : null;
	let currentId = ROOT_INODE;
	for (const name of pathTools.split(normalizedPath)) {
		currentId = childAt(value, currentId, name);
		if (!currentId) return null;
	}
	return currentId;
}

function pathToInode(db, normalizedPath) {
	return getInode(db, pathToInodeId(db, normalizedPath));
}

function setPathIndex(db, normalizedPath, inodeId) {
	const inode = getInode(db, inodeId);
	if (!inode || inode.path === normalizedPath) return inodeId;
	inode.path = normalizedPath;
	state.save(db, state.manifest(db));
	return inodeId;
}

function removePathIndex() {
	return true;
}

function createDirInode({ db, id, name, parent, path }) {
	return setInode(db, {
		id,
		type: 'dir',
		name,
		parent,
		path,
		size: 0,
		ctime: Date.now(),
		mtime: Date.now(),
		version: 1,
		deleted: false
	});
}

function createFileInode({ db, id, name, parent, path, record }) {
	return setInode(db, {
		id,
		type: 'file',
		name,
		parent,
		path,
		size: record.size,
		dataKind: record.kind,
		data: record.data,
		ctime: Date.now(),
		mtime: Date.now(),
		version: 1,
		deleted: false
	});
}

module.exports = {
	createDirInode,
	createFileInode,
	getInode,
	pathToInode,
	pathToInodeId,
	removeInode,
	removePathIndex,
	setInode,
	setPathIndex
};
