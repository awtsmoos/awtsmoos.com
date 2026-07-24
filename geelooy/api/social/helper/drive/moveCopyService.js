//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveMoveCopyService
 * @description
 * The Awtsmoos lets a tree change garments without losing identity. Awtsmoos.com
 * moves metadata without charging bytes and copies logical bytes under quota.
 */

const { normalizeDrivePath } = require('./pathPolicy.js');
const { mutateDriveState } = require('./stateRepository.js');
const { isAtOrBelow, remapPath, fileTotals, ensureParentFolders } = require('./entryHelpers.js');
const { assertStorageDelta } = require('./quotaPolicy.js');
const { recordDriveEvent } = require('./auditEvents.js');

async function moveDriveEntry(options) {
	return mutateTree(options, false);
}

async function copyDriveEntry(options) {
	return mutateTree(options, true);
}

async function mutateTree(options, copy) {
	const fromPath = normalizeDrivePath(options.fromPath);
	const toPath = normalizeDrivePath(options.toPath);
	if (isAtOrBelow(toPath, fromPath)) throw treeError('DESTINATION_INSIDE_SOURCE');
	return mutateDriveState(options.aliasId, options.$i, state => {
		const source = state.entries[fromPath];
		if (!source || source.trashedAt) throw treeError('SOURCE_NOT_FOUND');
		if (state.entries[toPath] && !state.entries[toPath].trashedAt) {
			throw treeError('DESTINATION_EXISTS');
		}
		const selected = Object.values(state.entries)
			.filter(entry => !entry.trashedAt && isAtOrBelow(entry.path, fromPath));
		if (copy) {
			const totals = fileTotals(selected);
			const next = assertStorageDelta(state, totals.bytes, totals.files);
			state.usage.storedBytes = next.nextBytes;
			state.usage.fileCount = next.nextFiles;
		}
		const now = new Date().toISOString();
		ensureParentFolders(state, toPath, now, options.aliasId);
		const replacements = {};
		for (const entry of selected) {
			const newPath = remapPath(entry.path, fromPath, toPath);
			replacements[newPath] = {
				...entry,
				path: newPath,
				createdAt: copy ? now : entry.createdAt,
				updatedAt: now
			};
			if (!copy) delete state.entries[entry.path];
		}
		Object.assign(state.entries, replacements);
		const event = recordDriveEvent(state, {
			type: copy ? 'entry.copy' : 'entry.move',
			actorUserId: options.actorUserId,
			fromPath,
			toPath,
			requestId: options.requestId
		});
		return { entries: Object.values(replacements), usage: state.usage, event };
	});
}

function treeError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	moveDriveEntry,
	copyDriveEntry
};
