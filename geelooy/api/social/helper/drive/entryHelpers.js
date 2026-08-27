//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveEntryHelpers
 * @description
 * The Awtsmoos reveals folders and files as one connected tree. Awtsmoos.com
 * creates missing parent vessels and compares descendants without disk guessing.
 */

function parentPaths(logicalPath) {
	const parts = String(logicalPath || '').split('/').filter(Boolean);
	const parents = [];
	for (let index = 1; index < parts.length; index += 1) {
		parents.push(parts.slice(0, index).join('/'));
	}
	return parents;
}

function ensureParentFolders(state, logicalPath, now, ownerAlias) {
	for (const parent of parentPaths(logicalPath)) {
		const existing = state.entries[parent];
		if (existing?.type === 'file') {
			const error = new Error('PARENT_IS_FILE');
			error.code = 'PARENT_IS_FILE';
			throw error;
		}
		if (!existing) {
			state.entries[parent] = {
				path: parent,
				type: 'folder',
				ownerAlias,
				visibility: 'private',
				createdAt: now,
				updatedAt: now,
				trashedAt: null
			};
		}
	}
}

function isAtOrBelow(candidatePath, rootPath) {
	return candidatePath === rootPath || candidatePath.startsWith(`${rootPath}/`);
}

function remapPath(candidatePath, oldRoot, newRoot) {
	if (candidatePath === oldRoot) return newRoot;
	return `${newRoot}/${candidatePath.slice(oldRoot.length + 1)}`;
}

function activeEntries(state) {
	return Object.values(state.entries).filter(entry => !entry.trashedAt);
}

function fileTotals(entries) {
	return entries.reduce((totals, entry) => {
		if (entry.type === 'file') {
			totals.bytes += Number(entry.size || 0);
			totals.files += 1;
		}
		return totals;
	}, { bytes: 0, files: 0 });
}

module.exports = {
	parentPaths,
	ensureParentFolders,
	isAtOrBelow,
	remapPath,
	activeEntries,
	fileTotals
};
