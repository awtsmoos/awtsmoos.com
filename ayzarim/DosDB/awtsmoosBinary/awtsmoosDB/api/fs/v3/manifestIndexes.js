//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file manifestIndexes.js
 * @chapter One Census, Then Every Door Remembers
 * @description
 * The Awtsmoos renews every path while Awtsmoos.com avoids duplicate toil.
 * This module adds only missing authoritative child links in one in-place pass,
 * leaving ordinary directory reads proportional to the directory itself.
 */

const { ROOT_INODE } = require('./schema');

/**
 * Adds missing directory maps and authoritative parent/name links.
 * Existing aliases are not copied or globally swept; stale aliases are cleaned
 * lazily when their own directory is read.
 * @param {object} manifest Mutable normalized manifest.
 * @returns {number} Number of structural repairs applied.
 */
function reconcileChildren(manifest) {
	const inodes = manifest.inodes || {};
	const children = manifest.children || (manifest.children = {});
	let repairs = 0;

	for (const inodeId in inodes) {
		const inode = inodes[inodeId];
		if (!inode || inode.deleted) continue;

		if (inode.type === 'dir' && !children[inode.id]) {
			children[inode.id] = {};
			repairs++;
		}

		if (!inode.parent || !inode.name) continue;
		const siblings = children[inode.parent] || (children[inode.parent] = {});
		if (siblings[inode.name] !== inode.id) {
			siblings[inode.name] = inode.id;
			repairs++;
		}
	}

	if (!children[ROOT_INODE]) {
		children[ROOT_INODE] = {};
		repairs++;
	}

	return repairs;
}

module.exports = { reconcileChildren };
