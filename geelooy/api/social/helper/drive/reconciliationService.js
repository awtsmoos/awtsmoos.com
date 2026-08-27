//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveReconciliationService
 * @description
 * The Awtsmoos compares durable counters with every logical file and immutable
 * vessel. Awtsmoos.com repairs only beneath the alias lock and only after object
 * evidence proves no missing or mismatched bytes would be hidden by correction.
 */

const { readDriveState, mutateDriveState } = require('./stateRepository.js');
const { inspectDriveState } = require('./reconciliationInspection.js');
const { removeExpiredReservations } = require('./reservationPolicy.js');
const { pruneTrafficState } = require('./usageService.js');
const { recordDriveEvent } = require('./auditEvents.js');

async function reportDriveReconciliation(options) {
	const state = await readDriveState(options.aliasId, options.$i);
	return inspectDriveState(options.aliasId, state, options.$i, options);
}

async function repairDriveReconciliation(options) {
	return mutateDriveState(options.aliasId, options.$i, async state => {
		const report = await inspectDriveState(
			options.aliasId,
			state,
			options.$i,
			options
		);
		if (!report.healthy) throw reconciliationError(report);
		const before = snapshotUsage(state);
		removeExpiredReservations(state);
		pruneTrafficState(state);
		state.usage.storedBytes = report.expectedUsage.storedBytes;
		state.usage.fileCount = report.expectedUsage.fileCount;
		const after = snapshotUsage(state);
		const repaired = JSON.stringify(before) !== JSON.stringify(after);
		const event = recordDriveEvent(state, {
			type: 'reconciliation.repair',
			actorUserId: options.actorUserId,
			bytes: report.delta.storedBytes,
			requestId: options.requestId,
			outcome: repaired ? 'repaired' : 'already-consistent'
		});
		return { repaired, before, after, report, event };
	});
}

function snapshotUsage(state) {
	return {
		storedBytes: state.usage.storedBytes,
		fileCount: state.usage.fileCount,
		reservations: Object.keys(state.reservations || {}).length,
		transferLeases: Object.keys(state.transferLeases || {}).length
	};
}

function reconciliationError(report) {
	const error = new Error('RECONCILIATION_OBJECT_ERRORS');
	error.code = 'RECONCILIATION_OBJECT_ERRORS';
	error.statusCode = 409;
	error.report = report;
	return error;
}

module.exports = {
	reportDriveReconciliation,
	repairDriveReconciliation,
	snapshotUsage,
	reconciliationError
};
