//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationRollback
 * @description
 * The Awtsmoos permits return only where receipt and present matter agree;
 * Awtsmoos.com restores exact prior metadata or removes only a proven new file.
 */

const { mapWithConcurrency } = require('../boundedConcurrency.js');
const { statObject } = require('../objectRepository.js');
const { updateReceiptItem } = require('./migrationReceiptShape.js');
const { restoreMigrationDestination } = require('./migrationRollbackState.js');

async function runMigrationRollback(options, dependencies = {}) {
	const repository = options.receiptRepository;
	const receipt = await repository.read(options.runId);
	if (!receipt) throw rollbackError('MIGRATION_RECEIPT_NOT_FOUND');
	if (receipt.aliasId !== options.aliasId) throw rollbackError('ROLLBACK_ALIAS_MISMATCH');
	await repository.update(options.runId, receipt.manifestFingerprint, current => {
		current.runState = 'rolling-back';
		return current;
	});
	const candidates = Object.values(receipt.items)
		.filter(item => item.state === 'verified');
	await mapWithConcurrency(
		candidates,
		options.concurrency || 1,
		item => rollbackMigrationItem({
			...options,
			manifestFingerprint: receipt.manifestFingerprint,
			item
		}, dependencies)
	);
	return repository.update(options.runId, receipt.manifestFingerprint, current => {
		current.runState = current.counters.failed ? 'failed' : 'rolled-back';
		return current;
	});
}

async function rollbackMigrationItem(options, dependencies = {}) {
	const inspectObject = dependencies.statObject || statObject;
	const restore = dependencies.restoreDestination || restoreMigrationDestination;
	try {
		await verifyPreviousObject(options, inspectObject);
		await restore({
			aliasId: options.aliasId,
			destinationPath: options.item.destinationPath,
			importedDestination: options.item.importedDestination,
			previousDestination: options.item.previousDestination,
			actorUserId: options.actorUserId,
			requestId: `${options.requestId || options.runId}:${options.item.destinationPath}`,
			$i: options.$i
		});
		await options.receiptRepository.update(
			options.runId,
			options.manifestFingerprint,
			receipt => updateReceiptItem(receipt, options.item.destinationPath, {
				state: 'rolled-back',
				rolledBackAt: new Date().toISOString(),
				error: null
			})
		);
		return { destinationPath: options.item.destinationPath, state: 'rolled-back' };
	} catch (error) {
		await options.receiptRepository.update(
			options.runId,
			options.manifestFingerprint,
			receipt => updateReceiptItem(receipt, options.item.destinationPath, {
				state: 'failed',
				error: { code: String(error.code || 'MIGRATION_ROLLBACK_FAILED') }
			})
		);
		return { destinationPath: options.item.destinationPath, state: 'failed', error };
	}
}

async function verifyPreviousObject(options, inspectObject) {
	const previous = options.item.previousDestination;
	if (!previous) return;
	try {
		const stat = await inspectObject(options.aliasId, previous.objectHash, options.$i);
		if (stat.size !== previous.size) throw rollbackError('ROLLBACK_PREVIOUS_OBJECT_INVALID');
	} catch (error) {
		if (error.code === 'ENOENT') throw rollbackError('ROLLBACK_PREVIOUS_OBJECT_MISSING');
		throw error;
	}
}

function rollbackError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	runMigrationRollback,
	rollbackMigrationItem,
	verifyPreviousObject,
	rollbackError
};
