// B"H

/**
 * @file api/vector/pathResolver.js
 * @chapter Every Indexed Vessel Has One Canonical Name
 * @description
 * Resolves LiveHandles and dotted root paths without changing the database.
 */

const constants = require('../../constants.js');

function soul(handle) {
	return handle && (handle[constants.SYMBOLS.INTERNALS] || handle);
}

function pathOf(handle) {
	if (typeof handle === 'string') return handle;
	const state = soul(handle);
	if (state?.ensureResolved) state.ensureResolved(true);
	return state?.getPath ? state.getPath() : handle;
}

function resolvePath(db, requestedPath) {
	let current = db.root;
	for (const part of String(requestedPath).split('.').filter(part => part && part !== 'root')) {
		current = current && current[part];
		if (!current) return null;
	}
	return current;
}

module.exports = {
	pathOf,
	resolvePath,
	soul
};
