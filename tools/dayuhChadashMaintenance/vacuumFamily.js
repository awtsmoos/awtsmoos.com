// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module VacuumFamily
 * @description
 * Builds one external candidate from one live family. Healthy sources use strict
 * semantic vacuum; physically damaged FS3 sources use logical recovery. Neither
 * path can mutate or replace production, and every candidate remains unapproved.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const recoverLogicalFs = require('./logicalRecovery.js');
const { familyFile } = require('./policy.js');

function candidatePaths(policy, family, runId) {
	const runRoot = path.join(policy.workRoot, runId);
	const candidates = path.join(runRoot, 'candidates');
	const evidence = path.join(runRoot, 'evidence');
	fs.mkdirSync(candidates, { recursive: true });
	fs.mkdirSync(evidence, { recursive: true });
	const name = `social.heichel.ikar.${family}.fs.awtsdb`;
	return {
		runRoot,
		candidate: path.join(candidates, name),
		manifest: path.join(evidence, `${family}-candidate.json`)
	};
}

function buildFamilyCandidate(policy, decision, runId) {
	const source = familyFile(policy, decision.family);
	const paths = candidatePaths(policy, decision.family, runId);
	cleanup(paths.candidate);
	let report;
	if (decision.mode === 'logical-recovery') {
		report = recoverLogicalFs(source, paths.candidate, paths.manifest);
	} else {
		report = AwtsmoosDB.vacuumFile(source, paths.candidate, {
			cleanupOnFailure: true,
			compression: false,
			manifestPath: paths.manifest,
			destinationOptions: {
				reuseFreedSpace: 'verified',
				versions: false,
				virtualFsCompression: true,
				wal: false
			},
			sourceOptions: {
				processLockMode: 'shared',
				wal: false
			}
		});
		if (!report.comparison?.ok) {
			throw candidateError(decision.family, 'semantic comparison failed');
		}
	}
	return {
		family: decision.family,
		mode: decision.mode,
		source,
		candidate: paths.candidate,
		manifest: paths.manifest,
		report
	};
}

function cleanup(file) {
	for (const suffix of ['', '.wal', '.lock', '.readers']) {
		fs.rmSync(`${file}${suffix}`, { recursive: true, force: true });
	}
}

function candidateError(family, message) {
	const error = new Error(`B"H ${family} candidate refused: ${message}`);
	error.code = 'AWTSMOOS_MAINTENANCE_CANDIDATE_REFUSED';
	return error;
}

module.exports = {
	buildFamilyCandidate,
	candidatePaths,
	cleanup
};