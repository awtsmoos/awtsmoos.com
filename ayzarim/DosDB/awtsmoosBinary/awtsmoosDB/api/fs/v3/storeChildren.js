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
 *
 * Speed fix (K) Nov 10: setChild/removeChild mutate the session-cached
 * child-map in place instead of spreading it ({...current, [name]: id} is
 * O(directory size) per write — 7.1% of job CPU at 2,000 keys, measured
 * by node --cpu-prof). Safe: readChildren returns the session's detached
 * working copy (materialize copies on read; the persisted record is
 * untouched until flush assigns the cached value to db.root), and all
 * readers use the map synchronously, so no snapshot can observe a
 * half-mutated map. writeChildren marks it dirty; cacheSet's
 * same-reference fast path (storeState.js) skips the re-measure.
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
	current[name] = childId;
	state.writeChildren(db, directoryId, current);
	return childId;
}

function removeChild(db, directoryId, name) {
	const current = state.readChildren(db, directoryId);
	if (!current || !(name in current)) return true;
	delete current[name];
	state.writeChildren(db, directoryId, current);
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
