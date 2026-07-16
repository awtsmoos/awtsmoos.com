// B"H
// Boruch Hashem
// Blessed is He

/** @module InstallSupport @description Prepares and archives family files and sidecars. */

const fs = require('fs');
const path = require('path');
const { fileEvidence } = require('./inventory.js');

const SIDECAR_SUFFIXES = ['.wal', '.lock', '.readers'];

function prepareRecords(items, policy, runId, installError) {
	const archiveRoot = path.join(policy.workRoot, 'archives', runId);
	fs.mkdirSync(archiveRoot, { recursive: true });
	return items.map(item => {
		const archive = path.join(archiveRoot, path.basename(item.source));
		if (fs.existsSync(archive)) installError(`archive exists: ${archive}`);
		assertSameDevice(item.source, item.candidate, installError);
		assertSameDevice(item.source, archiveRoot, installError);
		return {
			...item,
			archive,
			before: fileEvidence(item.source),
			candidateBefore: fileEvidence(item.candidate),
			sidecars: SIDECAR_SUFFIXES
				.map(suffix => sidecarRecord(item.source, archive, suffix))
				.filter(Boolean)
		};
	});
}

function sidecarRecord(source, archive, suffix) {
	const live = `${source}${suffix}`;
	if (!fs.existsSync(live)) return null;
	return {
		suffix,
		live,
		archive: `${archive}${suffix}`,
		before: fileEvidence(live)
	};
}

function archiveRecord(record, installError) {
	fs.renameSync(record.source, record.archive);
	for (const sidecar of record.sidecars) {
		if (fs.existsSync(sidecar.archive)) {
			installError(`sidecar archive exists: ${sidecar.archive}`);
		}
		fs.renameSync(sidecar.live, sidecar.archive);
	}
}

function installationRecord(record) {
	return {
		family: record.family,
		live: fileEvidence(record.source),
		archive: fileEvidence(record.archive),
		archivePath: record.archive,
		sidecars: record.sidecars.map(sidecar => ({
			...sidecar,
			archiveEvidence: fileEvidence(sidecar.archive)
		}))
	};
}

function rollbackInstall(installed, archived) {
	for (const record of [...installed].reverse()) {
		if (fs.existsSync(record.source)) fs.renameSync(record.source, record.candidate);
	}
	for (const record of [...archived].reverse()) {
		if (fs.existsSync(record.archive)) fs.renameSync(record.archive, record.source);
		for (const sidecar of record.sidecars) {
			if (fs.existsSync(sidecar.archive)) {
				fs.renameSync(sidecar.archive, sidecar.live);
			}
		}
	}
}

function assertSameDevice(left, right, installError) {
	const leftDevice = fs.statSync(left).dev;
	const rightPath = fs.existsSync(right) ? right : path.dirname(right);
	if (leftDevice !== fs.statSync(rightPath).dev) {
		installError(`cross-device atomic rename refused: ${left} -> ${right}`);
	}
}

module.exports = {
	SIDECAR_SUFFIXES,
	archiveRecord,
	installationRecord,
	prepareRecords,
	rollbackInstall
};