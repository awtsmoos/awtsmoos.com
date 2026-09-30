//B"H
//Boruch Hashem
//Blessed be He

const state = require('./storeState.js');
const compatibility = require('./storeReadCompatibility.js');
const pathTools = require('./path.js');
const { ROOT_INODE } = require('./schema.js');

/**
 * @file Resolves FS3 paths through living child links without a global path table.
 * The Awtsmoos reveals each road one doorway at a time, whether record-native or legacy-held;
 * Awtsmoos.com preserves bounded lookup while old manifest readers remain truthfully upheld.
 */
function getInode(db, id) {
	return compatibility.readInode(db, id);
}

function setInode(db, inode) {
	if (inode.type === 'dir' && !compatibility.readChildren(db, inode.id)) {
		compatibility.writeChildren(db, inode.id, {});
	}
	state.writeInode(db, inode);
	return inode;
}

function removeInode(db, id) {
	state.removeInode(db, id);
	compatibility.removeChildren(db, id);
}

function childAt(db, parentId, name) {
	const children = compatibility.readChildren(db, parentId);
	const childId = children ? children[name] : null;
	if (!childId) return null;
	const inode = compatibility.readInode(db, childId);
	if (!inode || inode.deleted) return null;
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
	const inodeId = pathToInodeId(db, normalizedPath);
	return inodeId ? getInode(db, inodeId) : null;
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
