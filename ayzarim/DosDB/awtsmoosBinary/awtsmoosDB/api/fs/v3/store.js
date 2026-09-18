//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file store.js
 * @chapter Many Vessels, One Public Store
 * @description
 * The Awtsmoos unites small FS3 responsibilities behind the historical store
 * contract used by Awtsmoos.com. State, inode/path records, and child indexes
 * stay separate internally while every existing caller keeps the same API.
 */

const state = require('./storeState.js');
const inodes = require('./storeInodes.js');
const children = require('./storeChildren.js');

module.exports = {
	allocateInode: state.allocateInode,
	createDirInode: inodes.createDirInode,
	createFileInode: inodes.createFileInode,
	deleteChildrenMap: children.deleteChildrenMap,
	flush: state.flush,
	getChildren: children.getChildren,
	getInode: inodes.getInode,
	manifest: state.manifest,
	markTx: state.markTx,
	meta: state.meta,
	pathToInode: inodes.pathToInode,
	pathToInodeId: inodes.pathToInodeId,
	removeChild: children.removeChild,
	removeInode: inodes.removeInode,
	removePathIndex: inodes.removePathIndex,
	root: state.root,
	setChild: children.setChild,
	setInode: inodes.setInode,
	setPathIndex: inodes.setPathIndex
};
