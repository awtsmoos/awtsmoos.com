//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDatabaseBatch
 * @description
 * Applies a small validated document import with compensating rollback so one failed
 * write does not intentionally leave a half-imported project collection behind.
 */

const { assertValueSize, normalizeDatabaseKey, projectDbError } = require('./projectDatabaseValuePolicy.js');

const MAX_BATCH_DOCUMENTS = 50;
const MAX_BATCH_BYTES = 524288;

/** @param {object} scope Project database scope. @param {object} options Import options. @returns {Promise<object>} Mutation testimony. */
async function importProjectDocuments(scope, options = {}) {
	const path = options.path || '';
	const documents = normalizeDocuments(options.documents);
	const previous = [];
	for (const document of documents) {
		previous.push({ key: document.key, value: await scope.getKey(path, document.key) });
	}
	let written = 0;
	try {
		for (const document of documents) {
			await scope.setKey(path, document.key, document.value);
			written += 1;
		}
	} catch (error) {
		await rollback(scope, path, previous.slice(0, written));
		throw error;
	}
	return { imported: written, rolledBack: false };
}

/** @param {unknown} input Candidate documents. @returns {Array<object>} Validated bounded documents. */
function normalizeDocuments(input) {
	if (!Array.isArray(input) || !input.length) throw projectDbError('PROJECT_DB_IMPORT_EMPTY', 400);
	if (input.length > MAX_BATCH_DOCUMENTS) throw projectDbError('PROJECT_DB_IMPORT_TOO_MANY_DOCUMENTS', 413);
	let bytes = 0;
	const seen = new Set();
	return input.map(item => {
		const key = normalizeDatabaseKey(item?.key);
		if (seen.has(key)) throw projectDbError('PROJECT_DB_IMPORT_DUPLICATE_KEY', 400);
		seen.add(key);
		bytes += assertValueSize(item?.value);
		if (bytes > MAX_BATCH_BYTES) throw projectDbError('PROJECT_DB_IMPORT_TOO_LARGE', 413);
		return { key, value: item?.value };
	});
}

/** @param {object} scope Database scope. @param {string} path Collection path. @param {Array<object>} previous Prior values. */
async function rollback(scope, path, previous) {
	for (const item of previous.reverse()) {
		if (item.value === undefined) await scope.deleteKey(path, item.key);
		else await scope.setKey(path, item.key, item.value);
	}
}

module.exports = { MAX_BATCH_DOCUMENTS, MAX_BATCH_BYTES, importProjectDocuments, normalizeDocuments };
