// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LogicalFsRecovery
 * @description
 * Rebuilds damaged historical FS3 from readable logical bytes without duplicating
 * its enormous manifest in memory. The source is strict read-only; only in-memory
 * inode tokens change before one compressed destination manifest is committed.
 */

const store = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/store.js');
const codec = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/manifestCodec.js');
const blobValue = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/blobValue.js');
const { captureFileEvidence } = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/core/vacuum/fileEvidence.js');
const { logicalInventory } = require('./logicalInventory.js');
const support = require('./recoverySupport.js');

function recoverLogicalFs(sourcePath, candidatePath, manifestPath) {
	support.cleanupCandidate(candidatePath);
	const sourceBefore = captureFileEvidence(sourcePath);
	const source = support.openDatabase(sourcePath, true);
	const destination = support.openDatabase(candidatePath, false);
	let sourceInventory;
	let sourceVerification;
	try {
		sourceVerification = verificationSummary(source.verify());
		const manifest = store.manifest(source);
		const metadata = support.clone(
			support.plain(source, source.root.__awtsmoos_meta__) || {}
		);
		sourceInventory = logicalInventory(source, ({ inode, body }) => {
			const target = manifest.inodes[inode.id];
			const record = blobValue.makeDataRecord(destination, body, {
				kind: 'fs3-file',
				path: inode.path
			});
			target.dataKind = record.kind;
			target.data = record.data;
			target.size = record.size;
		});
		destination.root.__awtsmoos_meta__ = metadata;
		destination.root.__fs3_manifest__ = codec.encodeManifest(
			destination,
			manifest
		);
		destination.waitForIdle();
	} finally {
		support.closeDatabase(destination);
		support.closeDatabase(source);
	}
	const sourceAfter = captureFileEvidence(sourcePath);
	if (!support.sameEvidence(sourceBefore, sourceAfter)) {
		throw support.recoveryError('source changed during logical recovery');
	}
	const candidate = support.openDatabase(candidatePath, true);
	let candidateInventory;
	let candidateVerification;
	try {
		candidateInventory = logicalInventory(candidate);
		candidateVerification = candidate.verify();
	} finally {
		support.closeDatabase(candidate);
	}
	if (!candidateVerification.ok
		|| !support.sameInventory(sourceInventory, candidateInventory)) {
		throw support.recoveryError(
			'candidate verification or logical parity failed',
			{ candidateVerification, candidateInventory, sourceInventory }
		);
	}
	const report = buildReport({
		sourceBefore,
		sourceAfter,
		sourceVerification,
		sourceInventory,
		candidatePath,
		candidateVerification: verificationSummary(candidateVerification),
		candidateInventory
	});
	support.writeJson(manifestPath, report);
	return report;
}

function verificationSummary(report = {}) {
	return {
		ok: report.ok === true,
		fileSize: report.fileSize,
		allocatedBytes: report.allocatedBytes,
		liveBytes: report.liveBytes,
		freeBytes: report.freeBytes,
		badCount: Array.isArray(report.badRanges) ? report.badRanges.length : 0,
		overlapCount: Array.isArray(report.overlaps) ? report.overlaps.length : 0
	};
}

function buildReport(values) {
	return {
		format: 'awtsmoos-logical-fs-recovery-v1',
		createdAt: new Date().toISOString(),
		source: values.sourceBefore,
		sourceAfter: values.sourceAfter,
		sourceUnchanged: true,
		sourceVerification: values.sourceVerification,
		sourceInventory: values.sourceInventory,
		candidate: captureFileEvidence(values.candidatePath),
		candidateVerification: values.candidateVerification,
		candidateInventory: values.candidateInventory,
		logicalParity: true,
		productionEligible: false
	};
}

module.exports = recoverLogicalFs;