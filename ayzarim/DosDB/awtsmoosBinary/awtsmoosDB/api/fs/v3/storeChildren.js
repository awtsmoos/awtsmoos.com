//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file storeChildren.js
 * @chapter A Door Knows Only The Children At Its Threshold
 * @description
 * The Awtsmoos lets Awtsmoos.com read one FS3 directory without recounting the
 * whole inode world. Missing authoritative links are healed at load; stale local
 * aliases are removed lazily only when their own directory is actually read.
 */

const state = require('./storeState.js');

function getChildren(db, directoryId) {
	const value = state.manifest(db);
	const indexed = value.children[directoryId] || {};
	const children = {};
	const staleNames = [];

	for (const [name, inodeId] of Object.entries(indexed)) {
		const inode = value.inodes[inodeId];
		if (inode && !inode.deleted) {
			children[name] = inodeId;
		} else {
			staleNames.push(name);
		}
	}

	if (staleNames.length && !db.options?.readOnly) {
		for (const name of staleNames) {
			delete indexed[name];
		}
		state.save(db, value);
	}

	return children;
}

function setChild(db, directoryId, name, childId) {
	const value = state.manifest(db);
	value.children[directoryId] ||= {};
	value.children[directoryId][name] = childId;
	state.save(db, value);
	return childId;
}

function removeChild(db, directoryId, name) {
	const value = state.manifest(db);
	value.children[directoryId] ||= {};
	delete value.children[directoryId][name];
	state.save(db, value);
	return true;
}

function deleteChildrenMap(db, directoryId) {
	const value = state.manifest(db);
	delete value.children[directoryId];
	state.save(db, value);
}

module.exports = {
	deleteChildrenMap,
	getChildren,
	removeChild,
	setChild
};
