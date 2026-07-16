// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RollbackMaintenanceBatch
 * @description
 * Restores every archived family and sidecar after a failed readiness court. The
 * rejected generation remains external for evidence; restored databases verify
 * before the supervisor may start another child.
 */

const fs = require('fs');
const path = require('path');
const { assertExclusive } = require('./exclusive.js');
const { verifyLive } = require('./installBatch.js');
const { fileEvidence } = require('./inventory.js');

function rollbackPending(state, policy) {
	const installations = state.installations || [];
	if (!installations.length) return [];
	const targets = installations.flatMap(item => [
		item.live.file,
		item.archivePath,
		...(item.sidecars || []).flatMap(sidecar => [sidecar.live, sidecar.archive])
	]);
	assertExclusive(targets);
	const rejectedRoot = path.join(
		policy.workRoot,
		'rejected',
		state.pendingRunId || `run-${Date.now()}`
	);
	fs.mkdirSync(rejectedRoot, { recursive: true });
	const moved = [];
	const restored = [];
	try {
		for (const item of installations) {
			const rejected = path.join(rejectedRoot, path.basename(item.live.file));
			if (fs.existsSync(rejected)) {
				throw rollbackError(`rejected target exists: ${rejected}`);
			}
			fs.renameSync(item.live.file, rejected);
			moved.push({ ...item, rejected });
		}
		for (const item of installations) {
			fs.renameSync(item.archivePath, item.live.file);
			for (const sidecar of item.sidecars || []) {
				if (fs.existsSync(sidecar.archive)) {
					fs.renameSync(sidecar.archive, sidecar.live);
				}
			}
			restored.push(item);
		}
		for (const item of installations) verifyLive(item.live.file);
		return installations.map(item => ({
			family: item.family,
			live: fileEvidence(item.live.file),
			rejected: fileEvidence(
				path.join(rejectedRoot, path.basename(item.live.file))
			),
			restoredSidecars: (item.sidecars || [])
				.filter(sidecar => fs.existsSync(sidecar.live))
				.map(sidecar => fileEvidence(sidecar.live))
		}));
	} catch (error) {
		reverseRestore(restored, moved);
		throw rollbackError('rollback transaction failed', { cause: error });
	}
}

function reverseRestore(restored, moved) {
	for (const item of [...restored].reverse()) {
		for (const sidecar of item.sidecars || []) {
			if (fs.existsSync(sidecar.live)) {
				fs.renameSync(sidecar.live, sidecar.archive);
			}
		}
		if (fs.existsSync(item.live.file)) {
			fs.renameSync(item.live.file, item.archivePath);
		}
	}
	for (const item of [...moved].reverse()) {
		if (fs.existsSync(item.rejected)) {
			fs.renameSync(item.rejected, item.live.file);
		}
	}
}

function rollbackError(message, details = {}) {
	return Object.assign(new Error(`B"H rollback refused: ${message}`), {
		code: 'AWTSMOOS_MAINTENANCE_ROLLBACK_REFUSED',
		...details
	});
}

module.exports = { rollbackPending, reverseRestore };
