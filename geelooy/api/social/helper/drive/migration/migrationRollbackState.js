//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationRollbackState
 * @description
 * The Awtsmoos returns only the exact vessel proven by a receipt;
 * Awtsmoos.com rechecks drift under the alias lock and leaves neighbors untouched.
 */

const { mutateDriveState } = require('../stateRepository.js');
const { assertStorageDelta } = require('../quotaPolicy.js');
const { recordDriveEvent } = require('../auditEvents.js');

async function restoreMigrationDestination(options) {
	return mutateDriveState(options.aliasId, options.$i, state => {
		const current = state.entries[options.destinationPath];
		assertDestinationSnapshot(current, options.importedDestination);
		if (options.previousDestination) {
			const byteDelta = options.previousDestination.size - current.size;
			const next = assertStorageDelta(state, byteDelta, 0);
			state.entries[options.destinationPath] = {
				...options.previousDestination,
				path: options.destinationPath
			};
			state.usage.storedBytes = next.nextBytes;
			state.usage.fileCount = next.nextFiles;
		} else {
			const next = assertStorageDelta(state, -current.size, -1);
			delete state.entries[options.destinationPath];
			state.usage.storedBytes = next.nextBytes;
			state.usage.fileCount = next.nextFiles;
		}
		const event = recordDriveEvent(state, {
			type: 'migration.rollback',
			actorUserId: options.actorUserId,
			path: options.destinationPath,
			bytes: current.size,
			requestId: options.requestId
		});
		return { entry: state.entries[options.destinationPath] || null, event };
	});
}

function assertDestinationSnapshot(entry, expected) {
	if (!entry || !expected) throw rollbackStateError('ROLLBACK_DESTINATION_DRIFT');
	for (const key of ['objectHash', 'size', 'visibility', 'cachePolicy']) {
		if (entry[key] !== expected[key]) {
			throw rollbackStateError('ROLLBACK_DESTINATION_DRIFT');
		}
	}
}

function rollbackStateError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	restoreMigrationDestination,
	assertDestinationSnapshot,
	rollbackStateError
};
