//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationItemWriter
 * @description
 * The Awtsmoos reads one source vessel only when its measured turn has arrived;
 * Awtsmoos.com retries minute-boundary denials without weakening canonical limits.
 */

const { SERVICE_QUOTA } = require('../quotaPolicy.js');
const { writeDriveFile } = require('../writeService.js');
const { readVerifiedMigrationSource } = require('./migrationSourceReader.js');
const { createMigrationWriteOptions } = require('./migrationImportSupport.js');

async function writeMigrationItem(options, item, dependencies = {}) {
	const writeFile = dependencies.writeFile || writeDriveFile;
	const readSource = dependencies.readSource || readVerifiedMigrationSource;
	const rateController = dependencies.rateController;
	const writeAttempt = async () => {
		const content = await readSource(
			options.sourceRoot,
			item,
			options.singleFileBytes || SERVICE_QUOTA.singleFileBytes
		);
		return writeFile(createMigrationWriteOptions(options, item, content));
	};
	if (!rateController) {
		return {
			result: await writeAttempt(),
			transientRateRetries: 0
		};
	}
	const controlled = await rateController.run(writeAttempt);
	return {
		result: controlled.value,
		transientRateRetries: controlled.retries
	};
}

module.exports = {
	writeMigrationItem
};
