//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationItemImporter
 * @description
 * The Awtsmoos moves one witnessed spark through the canonical drive vessel;
 * Awtsmoos.com records paced retries without mistaking a minute gate for failure.
 */

const {
	verifyMigrationDestination,
	assertVerifiedDestination
} = require('./migrationVerifier.js');
const { snapshotMigrationDestination } = require('./migrationDestinationSnapshot.js');
const { updateReceiptItem } = require('./migrationReceiptShape.js');
const { serializeMigrationError } = require('./migrationImportSupport.js');
const { writeMigrationItem } = require('./migrationItemWriter.js');

async function importMigrationItem(options, dependencies = {}) {
	const repository = options.receiptRepository;
	const verify = dependencies.verifyDestination || verifyMigrationDestination;
	const item = options.item;
	try {
		const before = await verifyDestination(options, item, verify, dependencies);
		if (before.healthy) return markSkipped(options, item, before.entry);
		const previousDestination = snapshotMigrationDestination(before.entry);
		await repository.update(options.runId, options.manifestFingerprint, receipt => {
			const current = receipt.items[item.destinationPath];
			return updateReceiptItem(receipt, item.destinationPath, {
				state: 'importing',
				attempts: Number(current.attempts || 0) + 1,
				previousDestination,
				error: null
			});
		});
		const writeEvidence = await writeMigrationItem(options, item, dependencies);
		const verification = await verifyDestination(options, item, verify, dependencies);
		assertVerifiedDestination(verification);
		await repository.update(options.runId, options.manifestFingerprint, receipt => {
			const current = receipt.items[item.destinationPath];
			return updateReceiptItem(receipt, item.destinationPath, {
				state: 'verified',
				importedDestination: snapshotMigrationDestination(verification.entry),
				verifiedAt: new Date().toISOString(),
				transientRateRetries: Number(current.transientRateRetries || 0)
					+ writeEvidence.transientRateRetries,
				error: null
			});
		});
		return {
			destinationPath: item.destinationPath,
			state: 'verified',
			transientRateRetries: writeEvidence.transientRateRetries
		};
	} catch (error) {
		await markFailed(options, item, error);
		return { destinationPath: item.destinationPath, state: 'failed', error };
	}
}

async function verifyDestination(options, item, verify, dependencies) {
	return verify({ aliasId: options.aliasId, item, $i: options.$i }, dependencies.verifier);
}

async function markSkipped(options, item, entry) {
	await options.receiptRepository.update(
		options.runId,
		options.manifestFingerprint,
		receipt => updateReceiptItem(receipt, item.destinationPath, {
			state: 'skipped',
			previousDestination: receipt.items[item.destinationPath].previousDestination
				|| snapshotMigrationDestination(entry),
			importedDestination: snapshotMigrationDestination(entry),
			verifiedAt: new Date().toISOString(),
			error: null
		})
	);
	return { destinationPath: item.destinationPath, state: 'skipped' };
}

async function markFailed(options, item, error) {
	await options.receiptRepository.update(
		options.runId,
		options.manifestFingerprint,
		receipt => updateReceiptItem(receipt, item.destinationPath, {
			state: 'failed',
			error: serializeMigrationError(error)
		})
	);
}

module.exports = {
	importMigrationItem
};
