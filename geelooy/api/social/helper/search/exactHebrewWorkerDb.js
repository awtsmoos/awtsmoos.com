// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewWorkerDb
 * @description
 * The exact-index worker owns one canonical read-only database handle. Opening
 * and closing remain separate from search, serialization, and message routing.
 */

const { performance } = require('perf_hooks');
const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

function openDatabase(dbPath) {
	const startedAt = performance.now();
	const database = new AwtsmoosDB(dbPath, {
		compression: true,
		wal: false,
		readOnly: true
	});
	database.open();
	return {
		database,
		openMs: Number((performance.now() - startedAt).toFixed(3))
	};
}

function closeDatabase(database) {
	try {
		database?.close();
	} catch {
		// Read-only storage is already leaving the process.
	}
}

module.exports = {
	closeDatabase,
	openDatabase
};
