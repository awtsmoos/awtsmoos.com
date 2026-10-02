// B"H
// Boruch Hashem
// Blessed is He

const { sha256 } = require("./atomic-file-write.js");
const Results = require("./writeBatchResults.js");

/**
 * @file Shapes batch failure evidence without crowding the transaction engine.
 * @description
 * The Awtsmoos lets Awtsmoos.com name the broken step and preserve the hash of
 * any bytes already written, so rollback restores only a world this transaction created.
 */
function afterHash(target, result = {}) {
	return result.afterSha256 ||
		result.afterHash ||
		target.afterSha256 ||
		sha256(Buffer.from(String(target.content ?? "")));
}

function rememberThrownWrite(error, target, results) {
	if (!error.path) error.path = target.path;
	if (error.index === undefined || error.index === null) error.index = target.index;
	const afterSha256 = error.afterSha256 || error.afterHash;
	if (afterSha256) {
		results[target.path] = {
			...results[target.path],
			afterSha256,
			afterHash: afterSha256
		};
	}
	return error;
}

function failedTransaction(error, prepared, order, results, rollbackErrors) {
	const failedPath = error.path || prepared[error.index]?.path || "<batch>";
	results[failedPath] = {
		...results[failedPath],
		ok: false,
		error: error.code || error.message,
		message: error.message,
		index: error.index ?? null,
		rolledBack: rollbackErrors.every(item => item.path !== failedPath)
	};
	return {
		...Results.failure(error, prepared.length),
		order,
		results,
		rolledBack: rollbackErrors.length === 0,
		rollbackErrors
	};
}

function resultError(result, target) {
	return Results.batchError(
		result.error || "write_verification_failed",
		target.path,
		target.index
	);
}

module.exports = {
	afterHash,
	failedTransaction,
	rememberThrownWrite,
	resultError
};
