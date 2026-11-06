// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/swap/productionVacuum.js
 * @chapter The Production Crossing Has A Procedure, Not Just Primitives
 * @description
 * The missing production procedure (§8.4) around the engine primitives
 * that already exist: vacuumFile, atomicSwap, rollbackSwap, manifestGate.
 * It builds a verified out-of-place candidate and swaps it in — it never
 * rewrites the live file in place (that recreates the Oct 27 failure
 * mode) and it never runs a live vacuum by itself: the caller must have
 * quiesced the file first (server stopped, writers idle) and must attest
 * to that with `serverStopped: true`. The procedure then PROVES exclusive
 * ownership by taking the file's exclusive process lock for its whole
 * run; if the server still holds the file, the lock acquire throws and
 * the procedure refuses before touching anything.
 *
 * Steps: preconditions (same-filesystem paths, disk headroom) → WAL
 * sidecar check (a non-empty .wal refuses: replay it first with a clean
 * server start/stop) → exclusive lock → archive the live file with a
 * verified hash (reflink copy when the filesystem supports it) →
 * vacuumFile to a same-filesystem candidate → close the 8 gates →
 * rollback rehearsal against scratch copies → atomicSwap with the
 * approval manifest → post-swap smoke checks → keep the archived
 * original (and the renamed original at the rollback path) until the
 * next successful maintenance window.
 *
 * Gates: 7 of the 8 close inside this procedure from engine evidence.
 * The 8th — apiMatrixPassed (the API semantic smoke matrix against the
 * running service) — cannot be run by this module; the operator closes
 * it by passing `gates: { apiMatrixPassed: true, apiMatrixEvidence:
 * '...' }`. Without it the procedure stops before the swap and reports
 * the open gate. A `--dry-run` mode checks preconditions and gate
 * inventory without archiving, vacuuming, or swapping anything.
 *
 * Disk headroom: the candidate needs ~source size free, the archive
 * needs ~source size again unless the filesystem reflinks it to ~0,
 * and the rollback rehearsal needs scratch copies (reflinked when
 * possible). A 14 GB live file needs on the order of 14–28 GB free
 * depending on reflink support. The procedure measures the filesystem
 * and refuses when the math does not fit.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const AwtsmoosDB = require('../../index.js');
const vacuumFile = require('../vacuum/index.js');
const atomicSwap = require('./atomicSwap.js');
const rollbackSwap = require('./rollback.js');
const { REQUIRED_GATES } = require('./manifestGate.js');
const { captureFileEvidence, sha256File } = require('../vacuum/fileEvidence.js');
const { fsyncPaths } = require('./durability.js');
const ProcessLock = require('../processLock.js');

const MARGIN_BYTES = 256 * 1024 * 1024; // 256 MiB cap on the scaled headroom margin (see preconditions)

function procedureError(message, details) {
	const error = new Error(`B"H production vacuum refused: ${message}`);
	error.code = 'AWTSMOOS_DB_PRODUCTION_VACUUM_REFUSED';
	error.details = details || null;
	return error;
}

function sameDevice(left, right) {
	return fs.statSync(left).dev === fs.statSync(right).dev;
}

function freeBytes(directory) {
	const stat = fs.statfsSync(directory);
	return Number(stat.bavail) * Number(stat.bsize);
}

function tryReflinkCopy(source, destination) {
	try {
		execFileSync('cp', ['--reflink=always', source, destination], { stdio: 'ignore' });
		return true;
	} catch (_error) {
		return false;
	}
}

function copyFile(source, destination) {
	fs.copyFileSync(source, destination);
	fsyncPaths([destination]);
}

function walPathFor(livePath) {
	return `${livePath}.wal`;
}

function walBytes(livePath) {
	const wal = walPathFor(livePath);
	if (!fs.existsSync(wal)) return 0;
	return fs.statSync(wal).size;
}

function countFs3Inodes(db) {
	let count = 0;
	for (const key of db.keys(db.root)) {
		if (String(key).startsWith('__fs3_inode__')) count++;
	}
	return count;
}

function countRootKeys(db) {
	return db.keys(db.root).length;
}

/**
 * Runs the production vacuum procedure.
 * @param {object} options
 * @param {string} options.livePath - Live .awtsdb file.
 * @param {boolean} options.serverStopped - Operator attestation that the
 *   server is stopped and no writer can touch the file. Required.
 * @param {string} [options.workDir] - Directory for candidate, archive,
 *   rollback, scratch, and report. Defaults to the live file's directory.
 *   MUST be on the same filesystem as the live file (rename-based swap).
 * @param {string} [options.candidatePath] - Explicit candidate path.
 * @param {string} [options.reportPath] - Where to write the JSON report.
 * @param {boolean} [options.dryRun] - Check preconditions and gate
 *   inventory only; archive, vacuum, and swap nothing.
 * @param {object} [options.gates] - Operator-closed gates, e.g.
 *   { apiMatrixPassed: true, apiMatrixEvidence: '...' }.
 * @param {object} [options.logger] - Logger with info/error (default console).
 * @returns {object} Procedure report (steps, gates, hashes, paths).
 */
function runProductionVacuum(options = {}) {
	const logger = options.logger || console;
	const livePath = path.resolve(options.livePath || '');
	const workDir = path.resolve(options.workDir || path.dirname(livePath));
	const stamp = new Date().toISOString().replace(/[:.]/g, '-');
	const base = path.basename(livePath);
	const candidatePath = path.resolve(options.candidatePath || path.join(workDir, `${base}.vacuum-candidate-${stamp}.awtsdb`));
	const archivePath = path.join(workDir, `${base}.archive-${stamp}.awtsdb`);
	const rollbackPath = path.join(workDir, `${base}.rollback-${stamp}.awtsdb`);
	const reportPath = path.resolve(options.reportPath || path.join(workDir, `${base}.production-vacuum-report-${stamp}.json`));
	const scratchDir = path.join(workDir, `.vacuum-scratch-${stamp}`);
	const report = {
		format: 'awtsmoosdb-production-vacuum-v1',
		startedAt: new Date().toISOString(),
		livePath,
		candidatePath,
		archivePath,
		rollbackPath,
		reportPath,
		dryRun: Boolean(options.dryRun),
		steps: [],
		gates: {},
		ok: false
	};
	const step = (name, detail) => {
		report.steps.push({ name, at: new Date().toISOString(), ...(detail || {}) });
		if (typeof logger.info === 'function') logger.info(`B"H production vacuum [${name}] ${detail ? JSON.stringify(detail) : ''}`);
	};
	const fail = (message, details) => {
		report.error = message;
		report.finishedAt = new Date().toISOString();
		writeReport(report, reportPath, logger);
		throw procedureError(message, details);
	};

	let lock = null;
	try {
		// 0. Preconditions.
		if (!options.serverStopped) {
			fail('serverStopped attestation is required — stop the server and quiesce writers first', { livePath });
		}
		if (!livePath || !fs.existsSync(livePath) || !fs.statSync(livePath).isFile()) {
			fail('live file is missing', { livePath });
		}
		if (fs.existsSync(candidatePath)) fail('candidate path already exists — remove it first', { candidatePath });
		if (fs.existsSync(rollbackPath)) fail('rollback path already exists — remove it first', { rollbackPath });
		if (fs.existsSync(archivePath)) fail('archive path already exists — remove it first', { archivePath });
		fs.mkdirSync(workDir, { recursive: true });
		if (!sameDevice(livePath, workDir)) {
			fail('work directory must be on the same filesystem as the live file (rename-based swap)', { livePath, workDir });
		}
		const liveEvidence = captureFileEvidence(livePath);
		const liveSize = liveEvidence.size;
		const available = freeBytes(workDir);
		// Worst case (no reflink): archive copy + full-size candidate,
		// plus a margin for the manifest, report and lock files. The
		// margin scales with the file (1 MiB floor, 256 MiB cap) and is
		// counted once — a flat 256 MiB margin refused tiny databases
		// on small filesystems for no reason (found by CLI smoke test).
		const marginBytes = Math.min(Math.max(liveSize, 1024 * 1024), MARGIN_BYTES);
		const reflinkWorks = tryReflinkProbe(workDir);
		const needBytes = (reflinkWorks ? liveSize : liveSize * 2) + marginBytes;
		step('preconditions', { liveSize, availableFreeBytes: available, reflinkSupported: reflinkWorks, needBytes });
		if (available < needBytes) {
			fail('disk headroom is short for this vacuum', { liveSize, availableFreeBytes: available, needBytes, reflinkSupported: reflinkWorks });
		}
		if (options.dryRun) {
			report.gates = gateInventory(options.gates);
			// Dry-run probes that disturb nothing: WAL sidecar size and
			// whether the exclusive lock is currently held by anyone.
			report.walBytes = walBytes(livePath);
			const probeLock = new ProcessLock(livePath);
			try {
				probeLock.acquire({ lockWaitMs: 0 });
				report.gates.exclusiveOwnershipProven = true;
				probeLock.release();
			} catch (_error) {
				report.gates.exclusiveOwnershipProven = false;
			}
			step('dry-run', { gates: report.gates, walBytes: report.walBytes });
			report.ok = true;
			report.finishedAt = new Date().toISOString();
			writeReport(report, reportPath, logger);
			return report;
		}

		// 1. WAL sidecar: a non-empty .wal means committed writes may
		// not be in the main file yet (the read-only vacuum source
		// never replays it). Refuse; the operator replays it with one
		// clean server start/stop first. The 8-byte WAL magic alone
		// (an empty journal) is fine.
		const walSize = walBytes(livePath);
		step('wal-check', { walBytes: walSize });
		if (walSize > 8) {
			fail('live file has a non-empty WAL sidecar — replay it first with one clean server start/stop', { walPath: walPathFor(livePath), walBytes: walSize });
		}

		// 2. Exclusive ownership, proven by taking the lock for the run.
		lock = new ProcessLock(livePath);
		try {
			lock.acquire({ lockWaitMs: 0 });
		} catch (error) {
			fail('exclusive ownership not proven — another process holds the live file', { lockError: error && error.message });
		}
		step('exclusive-ownership', { lockFile: lock.filePath, owner: true });

		// 3. Archive the live file with a verified hash.
		const archivedByReflink = tryReflinkCopy(livePath, archivePath);
		if (!archivedByReflink) {
			if (freeBytes(workDir) < liveSize * 2 + marginBytes) {
				fail('reflink archive unsupported and disk is short for a full archive copy', { liveSize, availableFreeBytes: freeBytes(workDir) });
			}
			copyFile(livePath, archivePath);
		}
		if (walSize > 0) copyFile(walPathFor(livePath), `${archivePath}.wal`);
		const archiveHash = sha256File(archivePath);
		if (archiveHash !== liveEvidence.sha256) {
			fail('archive hash does not match the live file', { liveSha256: liveEvidence.sha256, archiveSha256: archiveHash });
		}
		step('archive', { archivePath, reflink: archivedByReflink, sha256: archiveHash });

		// 4. Vacuum to a same-filesystem candidate.
		const manifestPath = `${candidatePath}.vacuum-manifest.json`;
		const manifest = vacuumFile(AwtsmoosDB, livePath, candidatePath, {
			manifestPath,
			cleanupOnFailure: true
		});
		const candidateEvidence = captureFileEvidence(candidatePath);
		step('vacuum', { manifestPath, bytesSaved: manifest.bytesSaved, comparisonOk: manifest.comparison.ok });
		if (!manifest.comparison.ok) {
			fail('vacuum candidate failed semantic comparison — live file untouched', { manifestPath });
		}

		// 5. Close the gates from engine evidence.
		const gates = {
			candidateVerified: Boolean(manifest.comparison.sourceVerification.ok && manifest.comparison.destinationVerification.ok),
			semanticDigestMatched: Boolean(manifest.comparison.digestEqual),
			apiMatrixPassed: Boolean(options.gates && options.gates.apiMatrixPassed === true),
			vectorParityPassed: Boolean(manifest.comparison.derivedVerification && manifest.comparison.derivedVerification.ok),
			virtualFsParityPassed: false,
			exclusiveOwnershipProven: true,
			rollbackRehearsed: false,
			archiveVerified: Boolean(archiveHash === liveEvidence.sha256 && fs.existsSync(archivePath) && sha256File(archivePath) === archiveHash)
		};
		// VirtualFs inventory: FS3 inode counts must be equal on both sides.
		{
			const source = new AwtsmoosDB(livePath, { readOnly: true });
			const candidate = new AwtsmoosDB(candidatePath, { readOnly: true });
			try {
				source.open();
				candidate.open();
				const sourceInodes = countFs3Inodes(source);
				const candidateInodes = countFs3Inodes(candidate);
				gates.virtualFsParityPassed = sourceInodes === candidateInodes
					&& countRootKeys(source) === manifest.comparison.sourceRootKeys
					&& countRootKeys(candidate) === manifest.comparison.destinationRootKeys;
				step('virtual-fs-parity', { sourceInodes, candidateInodes });
			} finally {
				try { candidate.close(); } catch (_error) {}
				try { source.close(); } catch (_error) {}
			}
		}
		// Rollback rehearsal against scratch copies on the same filesystem.
		fs.mkdirSync(scratchDir, { recursive: true });
		const scratchLive = path.join(scratchDir, 'live.awtsdb');
		const scratchRollback = path.join(scratchDir, 'rollback.awtsdb');
		const scratchFailed = path.join(scratchDir, 'failed.awtsdb');
		try {
			const scratchLiveOk = tryReflinkCopy(candidatePath, scratchLive) || (copyFile(candidatePath, scratchLive), true);
			const scratchRollbackOk = tryReflinkCopy(archivePath, scratchRollback) || (copyFile(archivePath, scratchRollback), true);
			if (!scratchLiveOk || !scratchRollbackOk) fail('rollback rehearsal copies failed', { scratchDir });
			const rehearsal = rollbackSwap({
				livePath: scratchLive,
				rollbackPath: scratchRollback,
				failedPath: scratchFailed,
				expectedRollbackSha256: archiveHash
			});
			gates.rollbackRehearsed = Boolean(rehearsal.ok && rehearsal.restoredSha256 === archiveHash);
			step('rollback-rehearsal', { ok: gates.rollbackRehearsed, restoredSha256: rehearsal.restoredSha256 });
		} finally {
			fs.rmSync(scratchDir, { recursive: true, force: true });
		}
		report.gates = gates;
		const openGates = REQUIRED_GATES.filter(gate => gates[gate] !== true);
		if (openGates.length) {
			fail('swap refused — gates still open', { openGates, gates });
		}
		step('gates-closed', { gates });

		// 6. Atomic swap with the approval manifest (fresh hashes).
		const approval = {
			format: 'awtsmoosdb-production-approval-v1',
			productionEligible: true,
			gates,
			livePath,
			candidatePath,
			rollbackPath,
			liveSha256: sha256File(livePath),
			candidateSha256: sha256File(candidatePath)
		};
		if (approval.liveSha256 !== liveEvidence.sha256) {
			fail('live file changed during the procedure — refusing the swap', { before: liveEvidence.sha256, now: approval.liveSha256 });
		}
		const swap = atomicSwap(approval);
		step('atomic-swap', { installedSha256: swap.installedSha256, archivedSha256: swap.archivedSha256 });

		// 7. Post-swap smoke checks; keep the archived original.
		{
			const swapped = new AwtsmoosDB(livePath, { readOnly: true });
			try {
				swapped.open();
				const smoke = swapped.storageReport({ verify: true });
				const smokeDigest = swapped.semanticDigest();
				if (!smoke.verification.ok) fail('post-swap smoke failed — verification of the swapped file failed', { livePath });
				if (smokeDigest !== manifest.comparison.destinationDigest) {
					fail('post-swap smoke failed — semantic digest does not match the candidate', { livePath });
				}
				if (countRootKeys(swapped) !== manifest.comparison.destinationRootKeys) {
					fail('post-swap smoke failed — root key count does not match the candidate', { livePath });
				}
				step('post-swap-smoke', {
					verifyOk: true,
					rootKeys: manifest.comparison.destinationRootKeys,
					physicalBytes: smoke.physicalBytes,
					unreachableLogicalBytes: smoke.unreachableLogicalBytes
				});
			} finally {
				try { swapped.close(); } catch (_error) {}
			}
		}
		report.swap = swap;
		report.archiveKeptAt = archivePath;
		report.rollbackKeptAt = rollbackPath;
		report.manifestPath = manifestPath;
		report.ok = true;
		report.finishedAt = new Date().toISOString();
		writeReport(report, reportPath, logger);
		return report;
	} catch (error) {
		if (error && error.code === 'AWTSMOOS_DB_PRODUCTION_VACUUM_REFUSED') throw error;
		report.error = error && error.message;
		report.finishedAt = new Date().toISOString();
		writeReport(report, reportPath, logger);
		throw error;
	} finally {
		if (lock) {
			try { lock.release(); } catch (_error) {}
		}
	}
}

function gateInventory(operatorGates) {
	const gates = {};
	for (const gate of REQUIRED_GATES) gates[gate] = false;
	gates.apiMatrixPassed = Boolean(operatorGates && operatorGates.apiMatrixPassed === true);
	return gates;
}

function tryReflinkProbe(directory) {
	const probe = path.join(directory, `.reflink-probe-${process.pid}`);
	const copy = `${probe}.copy`;
	try {
		fs.writeFileSync(probe, 'reflink-probe');
		const ok = tryReflinkCopy(probe, copy);
		return ok;
	} catch (_error) {
		return false;
	} finally {
		try { fs.rmSync(probe, { force: true }); } catch (_error) {}
		try { fs.rmSync(copy, { force: true }); } catch (_error) {}
	}
}

function writeReport(report, reportPath, logger) {
	try {
		fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
	} catch (error) {
		if (typeof logger.error === 'function') logger.error(`B"H could not write procedure report: ${error && error.message}`);
	}
}

module.exports = {
	runProductionVacuum,
	REQUIRED_GATES
};
