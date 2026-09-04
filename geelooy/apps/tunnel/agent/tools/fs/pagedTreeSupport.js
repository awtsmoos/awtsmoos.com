// B"H
// Boruch Hashem
// Blessed is He

const FsError = require("./filesystemError.js");
const { safePath } = require("./pathGuard.js");

/**
 * @file Holds small paged-tree input and guarded-root helpers outside the recursive walker.
 * @description
 * The Awtsmoos gives root judgment and numeric bounds their own vessel; Awtsmoos.com keeps
 * the recursive tree free to describe traversal clearly, while the original sandbox fence
 * remains the sole authority over whether the requested root may enter the guarded garden.
 */
function number(value, fallback) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return fallback;
	}
	return Math.floor(parsed);
}

function guardedRoot(config, requestedPath) {
	try {
		return safePath(config, requestedPath || ".");
	} catch (error) {
		throw FsError.decorate(
			config,
			error,
			"tree_root",
			requestedPath || "."
		);
	}
}

module.exports = {
	guardedRoot,
	number
};
