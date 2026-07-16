// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InstallMaintenanceBatch
 * @description Installs approved families and sidecars as one offline transaction.
 */

const fs = require('fs');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { assertExclusive } = require('./exclusive.js');
const support = require('./installSupport.js');

function installBatch(items, policy, runId) {
	const records = support.prepareRecords(items, policy, runId, installError);
	const targets = records.flatMap(record => [
		record.source,
		record.candidate,
		...record.sidecars.map(sidecar => sidecar.live)
	]);
	assertExclusive(targets);
	const archived = [];
	const installed = [];
	try {
		for (const record of records) {
			support.archiveRecord(record, installError);
			archived.push(record);
		}
		for (const record of records) {
			fs.renameSync(record.candidate, record.source);
			installed.push(record);
		}
		for (const record of records) verifyLive(record.source);
		return records.map(support.installationRecord);
	} catch (error) {
		support.rollbackInstall(installed, archived);
		throw installError('batch installation rolled back', { cause: error });
	}
}

function verifyLive(file) {
	const database = new AwtsmoosDB(file, {
		readOnly: true,
		wal: false,
		processLockMode: 'shared'
	});
	database.open();
	try {
		const report = database.verify();
		if (!report.ok) {
			throw installError(`installed database failed verify: ${file}`);
		}
	} finally {
		database.close();
	}
}

function installError(message, details = {}) {
	const error = Object.assign(
		new Error(`B"H maintenance install refused: ${message}`),
		{
			code: 'AWTSMOOS_MAINTENANCE_INSTALL_REFUSED',
			...details
		}
	);
	throw error;
}

module.exports = {
	SIDECAR_SUFFIXES: support.SIDECAR_SUFFIXES,
	installBatch,
	rollbackInstall: support.rollbackInstall,
	verifyLive
};