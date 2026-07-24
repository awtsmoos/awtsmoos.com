//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveTrashService
 * @description
 * The Awtsmoos conceals without annihilating, then restores or releases the
 * vessel. Awtsmoos.com counts trashed bytes until permanent purge prevents
 * quota evasion through an invisible second store.
 */

const { normalizeDrivePath } = require('./pathPolicy.js');
const { mutateDriveState } = require('./stateRepository.js');
const { isAtOrBelow, parentPaths, fileTotals } = require('./entryHelpers.js');
const { assertStorageDelta } = require('./quotaPolicy.js');
const { recordDriveEvent } = require('./auditEvents.js');

async function trashDriveEntry(options) {
	return mutateDriveState(options.aliasId, options.$i, state => {
		const logicalPath = normalizeDrivePath(options.path);
		const selected = selectTree(state, logicalPath);
		if (!selected.length) throw trashError('ENTRY_NOT_FOUND');
		const now = new Date().toISOString();
		for (const entry of selected) {
			entry.trashedAt = now;
			entry.updatedAt = now;
		}
		return mutationResult(state, options, 'entry.trash', logicalPath, selected);
	});
}

async function restoreDriveEntry(options) {
	return mutateDriveState(options.aliasId, options.$i, state => {
		const logicalPath = normalizeDrivePath(options.path);
		const selected = selectTree(state, logicalPath);
		if (!selected.length) throw trashError('ENTRY_NOT_FOUND');
		const now = new Date().toISOString();
		for (const parent of parentPaths(logicalPath)) {
			if (state.entries[parent]) state.entries[parent].trashedAt = null;
		}
		for (const entry of selected) {
			entry.trashedAt = null;
			entry.updatedAt = now;
		}
		return mutationResult(state, options, 'entry.restore', logicalPath, selected);
	});
}

async function purgeDriveEntry(options) {
	return mutateDriveState(options.aliasId, options.$i, state => {
		const logicalPath = normalizeDrivePath(options.path);
		const selected = selectTree(state, logicalPath);
		if (!selected.length) throw trashError('ENTRY_NOT_FOUND');
		const totals = fileTotals(selected);
		const next = assertStorageDelta(state, -totals.bytes, -totals.files);
		for (const entry of selected) delete state.entries[entry.path];
		state.usage.storedBytes = next.nextBytes;
		state.usage.fileCount = next.nextFiles;
		return mutationResult(state, options, 'entry.purge', logicalPath, selected, totals.bytes);
	});
}

function selectTree(state, logicalPath) {
	return Object.values(state.entries).filter(entry => isAtOrBelow(entry.path, logicalPath));
}

function mutationResult(state, options, type, logicalPath, entries, bytes = 0) {
	const event = recordDriveEvent(state, {
		type,
		actorUserId: options.actorUserId,
		path: logicalPath,
		bytes,
		requestId: options.requestId
	});
	return { entries, usage: state.usage, event };
}

function trashError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	trashDriveEntry,
	restoreDriveEntry,
	purgeDriveEntry
};
