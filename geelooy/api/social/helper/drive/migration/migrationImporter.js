//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationImporter
 * @description
 * The Awtsmoos coordinates many bounded vessels without losing one receipt;
 * Awtsmoos.com resumes verified truth while pacing every canonical upload gate.
 */

const { mapWithConcurrency } = require('../boundedConcurrency.js');
const { fingerprintManifest } = require('./migrationManifest.js');
const { importMigrationItem } = require('./migrationItemImporter.js');
const {
	createMigrationRateController
} = require('./migrationRateController.js');

async function runMigrationImport(options, dependencies = {}) {
	assertMigrationOptions(options);
	assertManifestIntegrity(options.manifest);
	const repository = options.receiptRepository;
	let receipt = await repository.createOrLoad({
		runId: options.runId,
		aliasId: options.aliasId,
		manifest: options.manifest
	});
	if (options.dryRun) return receipt;
	const rateController = dependencies.rateController
		|| createMigrationRateController({
			uploadsPerMinute: options.uploadRequestsPerMinute,
			...options.rateControl
		});
	receipt = await repository.update(
		options.runId,
		options.manifest.fingerprint,
		current => prepareRunningReceipt(current, rateController)
	);
	const itemOptions = {
		...options,
		manifestFingerprint: options.manifest.fingerprint
	};
	const itemDependencies = { ...dependencies, rateController };
	await mapWithConcurrency(
		options.manifest.items,
		options.concurrency || 2,
		item => importMigrationItem(
			{ ...itemOptions, item },
			itemDependencies
		)
	);
	return repository.update(
		options.runId,
		options.manifest.fingerprint,
		current => {
			current.runState = current.counters.failed ? 'failed' : 'completed';
			return current;
		}
	);
}

function prepareRunningReceipt(receipt, rateController) {
	receipt.runState = 'running';
	receipt.limitations = {
		...receipt.limitations,
		uploadRatePacing: true,
		uploadRequestsPerMinute: rateController.uploadsPerMinute,
		transientRateRetry: true,
		maximumRateRetries: rateController.maxRateRetries
	};
	return receipt;
}

function assertManifestIntegrity(manifest) {
	if (!manifest || fingerprintManifest(manifest) !== manifest.fingerprint) {
		throw migrationImportError('MIGRATION_MANIFEST_FINGERPRINT_INVALID');
	}
	const destinations = new Set();
	for (const item of manifest.items) {
		if (destinations.has(item.destinationPath)) {
			throw migrationImportError('MIGRATION_DESTINATION_DUPLICATE');
		}
		destinations.add(item.destinationPath);
	}
}

function assertMigrationOptions(options) {
	if (!options?.receiptRepository) {
		throw migrationImportError('MIGRATION_RECEIPT_REPOSITORY_REQUIRED');
	}
	for (const name of ['runId', 'aliasId', 'sourceRoot']) {
		if (!String(options[name] || '').trim()) {
			throw migrationImportError(`MIGRATION_${name.toUpperCase()}_REQUIRED`);
		}
	}
}

function migrationImportError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	runMigrationImport,
	prepareRunningReceipt,
	assertManifestIntegrity,
	assertMigrationOptions,
	migrationImportError
};
