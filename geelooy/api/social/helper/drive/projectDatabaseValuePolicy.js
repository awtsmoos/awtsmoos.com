//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDatabaseValuePolicy
 * @description Central bounded key/value law shared by single-document and batch project mutations.
 */

const MAX_VALUE_BYTES = 262144;

/** @param {unknown} value Candidate key. @returns {string} Safe key. */
function normalizeDatabaseKey(value) {
	const key = String(value || '').trim();
	if (!key || key.length > 160 || key === '.' || key === '..' || /[\\/\0]/.test(key)) {
		throw projectDbError('INVALID_PROJECT_DB_KEY', 400);
	}
	return key;
}

/** @param {unknown} value Candidate JSON value. @param {string} code Failure code. @returns {number} Encoded byte size. */
function assertValueSize(value, code = 'PROJECT_DB_VALUE_TOO_LARGE') {
	let encoded;
	try {
		encoded = JSON.stringify(value === undefined ? null : value);
	} catch {
		throw projectDbError('PROJECT_DB_VALUE_NOT_JSON', 400);
	}
	const bytes = Buffer.byteLength(encoded, 'utf8');
	if (bytes > MAX_VALUE_BYTES) throw projectDbError(code, 413);
	return bytes;
}

/** @param {string} code Stable failure code. @param {number} statusCode HTTP status. @returns {Error} Tagged error. */
function projectDbError(code, statusCode) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = { MAX_VALUE_BYTES, normalizeDatabaseKey, assertValueSize, projectDbError };
