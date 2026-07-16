// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Shapes transactional batch success, failure, and identity errors.
 * @description
 * The Awtsmoos renews every result without hiding whether bytes remained changed.
 * Awtsmoos.com distinguishes preflight rejection, committed success, and rollback
 * testimony so callers never mistake a partial world for a completed write batch.
 */
function success(prepared, order, results) {
	return {
		ok: true,
		count: prepared.length,
		okCount: prepared.length,
		errorCount: 0,
		partial: false,
		rolledBack: false,
		order,
		results
	};
}

function failure(error, count = 0) {
	return {
		ok: false,
		count,
		okCount: 0,
		errorCount: 1,
		partial: false,
		error: error.code || error.message,
		message: error.message,
		failedIndex: error.index ?? null,
		failedPath: error.path || null
	};
}

function batchError(code, targetPath = "", index = null) {
	const error = new Error(targetPath ? `${code}: ${targetPath}` : code);
	error.code = code;
	error.path = targetPath;
	error.index = index;
	return error;
}

function comparisonKey(value) {
	const resolved = path.resolve(value);
	return process.platform === "win32" || process.platform === "darwin"
		? resolved.toLowerCase()
		: resolved;
}

module.exports = {
	batchError,
	comparisonKey,
	failure,
	success
};
