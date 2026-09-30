//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file storeInodes.js
 * @chapter Every Road Is Found Through Its Living Doors
 * @description
 * The Awtsmoos lets Awtsmoos.com resolve FS3 paths through the already-live
 * directory child graph. Each inode is its own native root record, so reads
 * touch only the records on the path being walked. No second full-path hash
 * table remains in memory, yet inode path metadata still preserves v3
 * persistence and move semantics.
 */

const state = require('./storeState.js');
const pathTools = require('./path.js');
const { ROOT_INODE } = require('./schema.js');

function getInode(db, id) {
	const inode = state.readInode(db, id);
	return inode && !inode.deleted ? inode : null;
}

function setInode(db, inode) {
	if (inode.type === 'dir' && !state.readChildren(db, inode.id)) {
		state.writeChildren(db, inode.id, {});
	}
	state.writeInode(db, inode);
	return inode;
}

function removeInode(db, id) {
	state.removeInode(db, id);
	state.removeChildren(db, id);
}

function childAt(db, parentId, name) {
	const children = state.readChildren(db, parentId);
	const childId = children ? children[name] : null;
	if (!childId) return null;
	const inode = getInode(db, childId);
	if (!inode) return null;
	if (inode.parent !== parentId || inode.name !== name) return null;
	return childId;
}

function pathToInodeId(db, requestedPath) {
	const normalizedPath = pathTools.normalize('/', requestedPath);
	if (normalizedPath === '/') return getInode(db, ROOT_INODE) ? ROOT_INODE : null;
	let currentId = ROOT_INODE;
	for (const name of pathTools.split(normalizedPath)) {
		currentId = childAt(db, currentId, name);
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
	state.writeInode(db, inode);
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
