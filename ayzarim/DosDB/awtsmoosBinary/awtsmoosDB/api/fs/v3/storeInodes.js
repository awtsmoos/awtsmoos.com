//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file storeInodes.js
 * @chapter Every Record Keeps Its Own Name
 * @description
 * The Awtsmoos lets Awtsmoos.com address FS3 inodes and paths without mixing
 * record mutation into directory traversal. These operations preserve the v3
 * manifest contract while child maps remain maintained by their own module.
 */

const state = require('./storeState.js');

function getInode(db, id) {
	const inode = id ? state.manifest(db).inodes[id] : null;
	return inode && !inode.deleted ? inode : null;
}

function setInode(db, inode) {
	const value = state.manifest(db);
	value.inodes[inode.id] = inode;
	if (inode.path) value.paths[inode.path] = inode.id;
	if (inode.type === 'dir') value.children[inode.id] ||= {};
	state.save(db, value);
	return inode;
}

function removeInode(db, id) {
	const value = state.manifest(db);
	const inode = value.inodes[id];
	if (inode?.path) delete value.paths[inode.path];
	delete value.inodes[id];
	delete value.children[id];
	state.save(db, value);
}

function pathToInodeId(db, normalizedPath) {
	const value = state.manifest(db);
	const id = value.paths[normalizedPath];
	if (!id) return null;
	const inode = value.inodes[id];
	return inode && !inode.deleted ? id : null;
}

function pathToInode(db, normalizedPath) {
	return getInode(db, pathToInodeId(db, normalizedPath));
}

function setPathIndex(db, normalizedPath, inodeId) {
	const value = state.manifest(db);
	value.paths[normalizedPath] = inodeId;
	state.save(db, value);
	return inodeId;
}

function removePathIndex(db, normalizedPath) {
	const value = state.manifest(db);
	delete value.paths[normalizedPath];
	state.save(db, value);
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
