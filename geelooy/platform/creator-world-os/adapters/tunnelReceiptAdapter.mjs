// B"H
// Boruch Hashem
// Blessed is He
/** @module TunnelReceiptAdapter @description Converts live compact tunnel envelopes into immutable lineage and evidence. */
import { createEvidenceManifest } from '../release/evidenceManifest.mjs';
import { createJobLineage } from '../tunnel/jobLineage.mjs';
import { createQuarantineRecord } from '../tunnel/quarantineRecord.mjs';

/** Adapts a live tunnel response without requiring a particular storage backend. */
export function adaptTunnelReceipt(envelope, options = {}) {
	const receipt = envelope?.receipt || envelope || {};
	const jobId = String(receipt.jobId || envelope?.jobId || '').trim();
	if (!jobId) {
		throw new TypeError('Tunnel receipt requires jobId.');
	}
	const lineage = createJobLineage({
		jobId,
		parentJobId: options.parentJobId || null,
		rootJobId: options.rootJobId || options.parentJobId || jobId,
		action: receipt.action || envelope?.actualAction || envelope?.action,
		ownerId: envelope?.queue?.ownerId || envelope?.controlRequestId || '',
		inputHash: options.inputHash || receipt.inputHash || '',
		reason: options.reason || receipt.state || 'receipt',
		createdAt: receipt.createdAt || new Date().toISOString()
	});
	const evidence = createEvidenceManifest({
		trainId: options.trainId || 'tunnel-control',
		head: options.head || 'working-tree',
		createdAt: receipt.updatedAt || receipt.createdAt,
		tests: receipt.exitCode === 0 ? ['process-exit-zero'] : [],
		runtimeProfiles: [{
			workerId: receipt.workerId || envelope?.workerId || null,
			processIdentity: envelope?.processIdentity || null,
			state: receipt.state || envelope?.status || null
		}],
		limitations: envelope?.advisoryOvertime ? ['advisory-overtime'] : []
	});
	return Object.freeze({
		lineage,
		evidence,
		quarantine: createQuarantineIfNeeded(envelope, receipt),
		safeToReplay: receipt.safeToReplay === true
	});
}

function createQuarantineIfNeeded(envelope, receipt) {
	if (receipt.state !== 'quarantined' && envelope?.status !== 'quarantined') {
		return null;
	}
	return createQuarantineRecord({
		workerId: receipt.workerId || envelope?.workerId,
		jobId: receipt.jobId || envelope?.jobId,
		reason: envelope?.message || 'quarantined-worker',
		processIdentity: envelope?.processIdentity || {},
		logs: envelope?.stderr ? [envelope.stderr] : [],
		artifacts: envelope?.evidence || []
	});
}
