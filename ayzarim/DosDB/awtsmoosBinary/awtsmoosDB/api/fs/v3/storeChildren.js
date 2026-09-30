//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file storeChildren.js
 * @chapter A Door Knows Only The Children At Its Threshold
 * @description
 * The Awtsmoos lets Awtsmoos.com read one FS3 directory without recounting the
 * whole inode world. Each directory's child map is its own native root record,
 * so a directory read touches exactly one record. Missing authoritative links
 * are healed at load; stale local aliases are removed lazily only when their
 * own directory is actually read.
 */

const state = require('./storeState.js');

function getChildren(db, directoryId) {
	const indexed = state.readChildren(db, directoryId) || {};
	const children = {};
	const staleNames = [];

	for (const [name, inodeId] of Object.entries(indexed)) {
		const inode = state.readInode(db, inodeId);
		if (inode && !inode.deleted) {
			children[name] = inodeId;
		} else {
			staleNames.push(name);
		}
	}

	if (staleNames.length && !db.options?.readOnly) {
		const next = { ...indexed };
		for (const name of staleNames) {
			delete next[name];
		}
		state.writeChildren(db, directoryId, next);
	}

	return children;
}

function setChild(db, directoryId, name, childId) {
	const current = state.readChildren(db, directoryId) || {};
	state.writeChildren(db, directoryId, { ...current, [name]: childId });
	return childId;
}

function removeChild(db, directoryId, name) {
	const current = state.readChildren(db, directoryId);
	if (!current || !(name in current)) return true;
	const next = { ...current };
	delete next[name];
	state.writeChildren(db, directoryId, next);
	return true;
}

function deleteChildrenMap(db, directoryId) {
	state.removeChildren(db, directoryId);
}

module.exports = {
	deleteChildrenMap,
	getChildren,
	removeChild,
	setChild
};
