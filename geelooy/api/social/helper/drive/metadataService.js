//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveMetadataService
 * @description
 * The Awtsmoos lets a logical name choose concealment or revelation while the
 * underlying hash remains unchanged. Awtsmoos.com validates every policy switch.
 */

const { normalizeDrivePath } = require('./pathPolicy.js');
const { mutateDriveState } = require('./stateRepository.js');
const { recordDriveEvent } = require('./auditEvents.js');

async function updateDriveMetadata(options) {
	const logicalPath = normalizeDrivePath(options.path);
	return mutateDriveState(options.aliasId, options.$i, state => {
		const entry = state.entries[logicalPath];
		if (!entry || entry.trashedAt) throw metadataError('ENTRY_NOT_FOUND');
		if (options.visibility !== undefined) {
			entry.visibility = options.visibility === 'public' ? 'public' : 'private';
		}
		if (options.cachePolicy !== undefined && entry.type === 'file') {
			entry.cachePolicy = options.cachePolicy === 'immutable' ? 'immutable' : 'mutable';
		}
		entry.updatedAt = new Date().toISOString();
		const event = recordDriveEvent(state, {
			type: 'entry.metadata',
			actorUserId: options.actorUserId,
			path: logicalPath,
			requestId: options.requestId
		});
		return { entry, event };
	});
}

function metadataError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	updateDriveMetadata
};
