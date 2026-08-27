// B"H

/**
 * @file core/vacuum/index.js
 * @chapter A New World Is Proven Before The Old World Is Even Considered
 * @description
 * Orchestrates a strictly out-of-place rewrite. The destination uses verified
 * reuse so transient search and HNSW supersessions do not become a second growth
 * history while the candidate is being rebuilt.
 */

const fs = require('fs');
const vacuumPaths = require('./pathSafety.js');
const { captureFileEvidence } = require('./fileEvidence.js');
const copyDatabase = require('./copyDatabase.js');
const compareDatabases = require('./comparison.js');

function vacuumFile(Database, sourcePath, destinationPath, options = {}) {
	const paths = vacuumPaths(sourcePath, destinationPath);
	fs.mkdirSync(paths.parent, { recursive: true });
	const sourceBefore = captureFileEvidence(paths.source);
	let source = null;
	let destination = null;
	let sourceReport = null;
	let copyStats = null;

	try {
		source = new Database(paths.source, { ...options.sourceOptions, readOnly: true });
		source.open();
		sourceReport = source.storageReport();
		if (!sourceReport.verification.ok) throw vacuumError('source verification failed', sourceReport.verification);

		destination = new Database(paths.destination, {
			compression: options.compression !== false,
			reuseFreedSpace: 'verified',
			...options.destinationOptions,
			readOnly: false
		});
		destination.open();
		copyStats = copyDatabase(source, destination, options);
		destination.close();
		destination = null;
		source.close();
		source = null;

		const sourceAfter = captureFileEvidence(paths.source);
		if (!sameEvidence(sourceBefore, sourceAfter)) {
			throw vacuumError('strict read-only source evidence changed', { sourceBefore, sourceAfter });
		}

		const comparison = reopenAndCompare(Database, paths, options);
		const candidateEvidence = captureFileEvidence(paths.destination);
		const manifest = buildManifest(paths, sourceBefore, sourceAfter, candidateEvidence, sourceReport, copyStats, comparison);
		if (!comparison.ok) throw vacuumError('destination semantic comparison failed', manifest);
		if (options.manifestPath) fs.writeFileSync(options.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
		return manifest;
	} catch (error) {
		closeQuietly(destination);
		closeQuietly(source);
		if (options.cleanupOnFailure === true) cleanupCandidate(paths.destination);
		throw error;
	}
}

function reopenAndCompare(Database, paths, options) {
	const source = new Database(paths.source, { ...options.sourceOptions, readOnly: true });
	const destination = new Database(paths.destination, { ...options.sourceOptions, readOnly: true });
	try {
		source.open();
		destination.open();
		return compareDatabases(source, destination);
	} finally {
		closeQuietly(destination);
		closeQuietly(source);
	}
}

function buildManifest(paths, before, after, candidate, sourceReport, copyStats, comparison) {
	return {
		format: 'awtsmoosdb-vacuum-manifest-v1',
		createdAt: new Date().toISOString(),
		source: before,
		sourceAfter: after,
		sourceUnchanged: sameEvidence(before, after),
		destination: candidate,
		bytesSaved: Math.max(0, before.size - candidate.size),
		copyStats,
		sourceStorage: sourceReport,
		comparison,
		isolatedCandidateReady: comparison.ok,
		productionEligible: false,
		externalGatesRequired: ['API semantic matrix', 'vector parity', 'VirtualFs inventory', 'exclusive swap ownership', 'rollback rehearsal']
	};
}

function sameEvidence(left, right) {
	return left.sha256 === right.sha256 && left.size === right.size && left.mtimeNs === right.mtimeNs && left.inode === right.inode;
}

function closeQuietly(db) { try { if (db) db.close(); } catch (_error) {} }
function cleanupCandidate(file) {
	for (const suffix of ['', '.wal', '.lock', '.readers']) fs.rmSync(`${file}${suffix}`, { recursive: true, force: true });
}
function vacuumError(message, details) {
	const error = new Error(`B"H vacuum refused: ${message}`);
	error.code = 'AWTSMOOS_DB_VACUUM_FAILED';
	error.details = details;
	return error;
}

module.exports = vacuumFile;
