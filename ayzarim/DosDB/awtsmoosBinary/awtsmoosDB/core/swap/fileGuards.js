// B"H

/**
 * @file core/swap/fileGuards.js
 * @chapter The Names, Devices, And Hashes Must Agree Before Motion Begins
 * @description
 * Grounds an approved one-file swap in current filesystem evidence and rejects
 * aliases, cross-device renames, pre-existing rollback paths, and stale hashes.
 */

const fs = require('fs');
const path = require('path');
const { sha256File } = require('../vacuum/fileEvidence.js');

function inspectSwapFiles(approval) {
	const livePath = path.resolve(approval.livePath);
	const candidatePath = path.resolve(approval.candidatePath);
	const rollbackPath = path.resolve(approval.rollbackPath);
	if (new Set([livePath, candidatePath, rollbackPath]).size !== 3) {
		throw guardError('live, candidate, and rollback paths must be distinct');
	}
	if (!fs.existsSync(livePath) || !fs.statSync(livePath).isFile()) throw guardError('live file is missing');
	if (!fs.existsSync(candidatePath) || !fs.statSync(candidatePath).isFile()) throw guardError('candidate file is missing');
	if (fs.existsSync(rollbackPath)) throw guardError('rollback path already exists');
	const liveStat = fs.statSync(livePath);
	const candidateStat = fs.statSync(candidatePath);
	const rollbackParentStat = fs.statSync(path.dirname(rollbackPath));
	if (liveStat.dev !== candidateStat.dev || liveStat.dev !== rollbackParentStat.dev) {
		throw guardError('all swap paths must be on one filesystem');
	}
	const liveSha256 = sha256File(livePath);
	const candidateSha256 = sha256File(candidatePath);
	if (liveSha256 !== approval.liveSha256) throw guardError('live hash no longer matches approval');
	if (candidateSha256 !== approval.candidateSha256) throw guardError('candidate hash no longer matches approval');
	return { livePath, candidatePath, rollbackPath, liveSha256, candidateSha256 };
}

function guardError(message) {
	const error = new Error(`B"H production swap file guard refused: ${message}`);
	error.code = 'AWTSMOOS_DB_SWAP_FILE_GUARD_REFUSED';
	return error;
}

module.exports = inspectSwapFiles;
