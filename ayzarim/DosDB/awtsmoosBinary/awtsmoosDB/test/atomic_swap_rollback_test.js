// B"H

/**
 * @file test/atomic_swap_rollback_test.js
 * @chapter The Name Changes Once, And Every Broken Step Returns The Original
 * @description
 * Rehearses approval refusal, failure after archive, failure after installation,
 * successful exchange, and preservation of both files during explicit rollback.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const atomicSwap = require('../core/swap/atomicSwap.js');
const rollbackSwap = require('../core/swap/rollback.js');
const { sha256File } = require('../core/vacuum/fileEvidence.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function approval(livePath, candidatePath, rollbackPath) {
	return {
		format: 'awtsmoosdb-production-approval-v1',
		productionEligible: true,
		livePath,
		candidatePath,
		rollbackPath,
		liveSha256: sha256File(livePath),
		candidateSha256: sha256File(candidatePath),
		gates: {
			candidateVerified: true,
			semanticDigestMatched: true,
			apiMatrixPassed: true,
			vectorParityPassed: true,
			virtualFsParityPassed: true,
			exclusiveOwnershipProven: true,
			rollbackRehearsed: true,
			archiveVerified: true
		}
	};
}

function writePair(livePath, candidatePath) {
	fs.writeFileSync(livePath, 'original-live');
	fs.writeFileSync(candidatePath, 'verified-candidate');
}

function assertRestored(livePath, candidatePath, rollbackPath, stage) {
	assert(fs.readFileSync(livePath, 'utf8') === 'original-live', `${stage} did not restore live file`);
	assert(fs.readFileSync(candidatePath, 'utf8') === 'verified-candidate', `${stage} did not restore candidate path`);
	assert(!fs.existsSync(rollbackPath), `${stage} left a false rollback archive`);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-atomic-swap-'));
const livePath = path.join(directory, 'live.awtsdb');
const candidatePath = path.join(directory, 'candidate.awtsdb');
const rollbackPath = path.join(directory, 'original.rollback.awtsdb');
const failedPath = path.join(directory, 'failed-candidate.awtsdb');

try {
	writePair(livePath, candidatePath);
	let approved = approval(livePath, candidatePath, rollbackPath);
	let gateRefused = false;
	try { atomicSwap({ ...approved, productionEligible: false }); }
	catch (error) { gateRefused = error.code === 'AWTSMOOS_DB_SWAP_GATE_REFUSED'; }
	assert(gateRefused, 'incomplete approval was not refused');

	for (const stage of ['after-archive', 'after-install']) {
		let injected = false;
		try { atomicSwap(approved, { injectFailure: stage }); }
		catch (error) { injected = error.code === 'AWTSMOOS_DB_SWAP_INJECTED_FAILURE'; }
		assert(injected, `${stage} failure injection did not execute`);
		assertRestored(livePath, candidatePath, rollbackPath, stage);
		approved = approval(livePath, candidatePath, rollbackPath);
	}

	const installed = atomicSwap(approved);
	assert(installed.ok, 'atomic swap did not report success');
	assert(fs.readFileSync(livePath, 'utf8') === 'verified-candidate', 'candidate was not installed');
	assert(fs.readFileSync(rollbackPath, 'utf8') === 'original-live', 'original was not archived');

	const restored = rollbackSwap({
		livePath,
		rollbackPath,
		failedPath,
		expectedRollbackSha256: approved.liveSha256
	});
	assert(restored.ok, 'rollback did not report success');
	assert(fs.readFileSync(livePath, 'utf8') === 'original-live', 'original was not restored');
	assert(fs.readFileSync(failedPath, 'utf8') === 'verified-candidate', 'failed candidate was not preserved');
} finally {
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H atomic_swap_rollback_test PASS');
