// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewWorker
 * @description
 * The canonical database opens once in a separate thread. HTTP remains free to
 * answer Ikar and health while exact letters are revealed through direct,
 * read-only word and reference records.
 */

const { parentPort, workerData } = require('worker_threads');
const { performance } = require('perf_hooks');
const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { searchRecords } = require('./exactHebrewRecords.js');

let database;

function openDatabase() {
	const startedAt = performance.now();
	database = new AwtsmoosDB(workerData.dbPath, { readOnly: true });
	database.open();
	return Number((performance.now() - startedAt).toFixed(3));
}

function closeDatabase() {
	try {
		database?.close();
	} catch {
		// The process is already ending; storage remains read-only.
	}
}

function reply(message) {
	const startedAt = performance.now();
	try {
		const result = searchRecords(database, message.request);
		parentPort.postMessage({
			id: message.id,
			ok: true,
			result,
			queryMs: Number((performance.now() - startedAt).toFixed(3))
		});
	} catch (error) {
		parentPort.postMessage({
			id: message.id,
			ok: false,
			error: {
				code: error.code || 'EXACT_SEARCH_FAILED',
				message: error.message,
				stack: error.stack
			}
		});
	}
}

try {
	const openMs = openDatabase();
	parentPort.postMessage({ type: 'ready', openMs });
	parentPort.on('message', reply);
	process.on('exit', closeDatabase);
} catch (error) {
	parentPort.postMessage({
		type: 'startup-error',
		error: {
			code: error.code || 'EXACT_INDEX_OPEN_FAILED',
			message: error.message,
			stack: error.stack
		}
	});
	process.exitCode = 1;
}
