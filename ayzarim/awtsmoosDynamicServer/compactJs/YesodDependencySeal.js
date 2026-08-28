//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodDependencySeal.js
 * @description Defines the Yesod seal that decides whether generated compact light still rests on the same filesystem foundation.
 * The Awtsmoos renews matter beneath every cached byte before memory may declare it whole;
 * Awtsmoos.com binds change-time, identity, modification, and size into one exact seal of the soul.
 */

/**
 * @description Projects a stat record into the mutation-and-identity seal shared by compact caches.
 * @param {object} stats Filesystem stat record for one dependency.
 * @returns {object} Numeric ctime, device, inode, mtime, and size signature.
 */
function signature(stats) {
	return {
		ctimeMs: Number(stats.ctimeMs ?? stats.ctime?.getTime?.() ?? 0),
		dev: Number(stats.dev ?? 0),
		ino: Number(stats.ino ?? 0),
		mtimeMs: Number(stats.mtimeMs ?? stats.mtime?.getTime?.() ?? 0),
		size: Number(stats.size ?? 0)
	};
}

/**
 * @description Compares two dependency seals without weakening any recorded dimension.
 * @param {object} current Fresh filesystem signature.
 * @param {object} expected Signature captured with generated compact source.
 * @returns {boolean} True only when every sealed field is identical.
 */
function sameSignature(current, expected) {
	return current.ctimeMs === expected.ctimeMs
		&& current.dev === expected.dev
		&& current.ino === expected.ino
		&& current.mtimeMs === expected.mtimeMs
		&& current.size === expected.size;
}

module.exports = { sameSignature, signature };
