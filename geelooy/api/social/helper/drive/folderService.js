//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveFolderService
 * @description
 * The Awtsmoos reveals a directory as a vessel for future sparks. Awtsmoos.com
 * creates explicit folders while preserving private-by-default inheritance.
 */

const { normalizeDrivePath } = require('./pathPolicy.js');
const { mutateDriveState } = require('./stateRepository.js');
const { ensureParentFolders } = require('./entryHelpers.js');
const { recordDriveEvent } = require('./auditEvents.js');

async function createDriveFolder(options) {
	const logicalPath = normalizeDrivePath(options.path);
	return mutateDriveState(options.aliasId, options.$i, state => {
		const existing = state.entries[logicalPath];
		if (existing?.type === 'file') throw folderError('PATH_IS_FILE');
		if (existing && !existing.trashedAt) return { entry: existing, created: false };
		const now = new Date().toISOString();
		ensureParentFolders(state, logicalPath, now, options.aliasId);
		state.entries[logicalPath] = {
			path: logicalPath,
			type: 'folder',
			ownerAlias: options.aliasId,
			visibility: options.visibility === 'public' ? 'public' : 'private',
			createdAt: existing?.createdAt || now,
			updatedAt: now,
			trashedAt: null
		};
		const event = recordDriveEvent(state, {
			type: 'folder.create',
			actorUserId: options.actorUserId,
			path: logicalPath,
			requestId: options.requestId
		});
		return { entry: state.entries[logicalPath], created: true, event };
	});
}

function folderError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	createDriveFolder
};
