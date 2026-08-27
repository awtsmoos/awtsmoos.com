// B"H

/**
 * @file core/swap/rollback.js
 * @chapter The Former Vessel Returns Without Erasing The Failed One
 * @description
 * Restores an archived original through same-filesystem renames and preserves the
 * rejected live candidate under a quarantine name for later forensic inspection.
 */

const fs = require('fs');
const path = require('path');
const { sha256File } = require('../vacuum/fileEvidence.js');
const { fsyncPaths } = require('./durability.js');

function rollbackSwap(options) {
	const livePath = path.resolve(options.livePath);
	const rollbackPath = path.resolve(options.rollbackPath);
	const failedPath = path.resolve(options.failedPath);
	if (!fs.existsSync(livePath)) throw rollbackError('current live file is missing');
	if (!fs.existsSync(rollbackPath)) throw rollbackError('archived original is missing');
	if (fs.existsSync(failedPath)) throw rollbackError('failed-candidate quarantine path already exists');
	if (options.expectedRollbackSha256 && sha256File(rollbackPath) !== options.expectedRollbackSha256) {
		throw rollbackError('archived original hash does not match expectation');
	}
	const liveStat = fs.statSync(livePath);
	const rollbackStat = fs.statSync(rollbackPath);
	const failedParent = fs.statSync(path.dirname(failedPath));
	if (liveStat.dev !== rollbackStat.dev || liveStat.dev !== failedParent.dev) {
		throw rollbackError('rollback paths must share one filesystem');
	}
	fs.renameSync(livePath, failedPath);
	try {
		fs.renameSync(rollbackPath, livePath);
		fsyncPaths([livePath, failedPath]);
	} catch (error) {
		if (!fs.existsSync(livePath) && fs.existsSync(failedPath)) fs.renameSync(failedPath, livePath);
		throw error;
	}
	return {
		ok: true,
		livePath,
		failedPath,
		restoredSha256: sha256File(livePath),
		failedSha256: sha256File(failedPath)
	};
}

function rollbackError(message) {
	const error = new Error(`B"H rollback refused: ${message}`);
	error.code = 'AWTSMOOS_DB_ROLLBACK_REFUSED';
	return error;
}

module.exports = rollbackSwap;
