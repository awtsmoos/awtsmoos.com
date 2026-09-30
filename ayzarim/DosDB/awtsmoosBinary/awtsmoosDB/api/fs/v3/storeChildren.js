//B"H
//Boruch Hashem
//Blessed be He

const compatibility = require('./storeReadCompatibility.js');

/**
 * @file Reads one directory child map without enumerating the inode universe.
 * The Awtsmoos keeps each alias bound to a living inode whose parent and name still agree;
 * Awtsmoos.com heals only the touched directory, so stale or deleted roads quietly cease to be.
 */
function getChildren(db, directoryId) {
	const indexed = compatibility.readChildren(db, directoryId) || {};
	const children = {};
	const staleNames = [];
	for (const [name, inodeId] of Object.entries(indexed)) {
		const inode = compatibility.readInode(db, inodeId);
		if (validChild(inode, directoryId, name)) {
			children[name] = inodeId;
		} else {
			staleNames.push(name);
		}
	}
	if (staleNames.length && !db.options?.readOnly) {
		const next = { ...indexed };
		for (const name of staleNames) delete next[name];
		compatibility.writeChildren(db, directoryId, next);
	}
	return children;
}

function validChild(inode, directoryId, name) {
	return Boolean(
		inode &&
		!inode.deleted &&
		inode.parent === directoryId &&
		inode.name === name
	);
}

function setChild(db, directoryId, name, childId) {
	const current = compatibility.readChildren(db, directoryId) || {};
	compatibility.writeChildren(db, directoryId, { ...current, [name]: childId });
	return childId;
}

function removeChild(db, directoryId, name) {
	const current = compatibility.readChildren(db, directoryId);
	if (!current || !(name in current)) return true;
	const next = { ...current };
	delete next[name];
	compatibility.writeChildren(db, directoryId, next);
	return true;
}

function deleteChildrenMap(db, directoryId) {
	return compatibility.removeChildren(db, directoryId);
}

module.exports = {
	deleteChildrenMap,
	getChildren,
	removeChild,
	setChild,
	validChild
};
