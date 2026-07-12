// B"H

/**
 * @file api/admin/storageReport.js
 * @chapter The Ledger Separates What Exists From What May Be Reclaimed
 * @description
 * Builds a non-mutating storage report. Persisted free claims and verified free
 * complement remain separate so operators never confuse metadata with proof.
 */

const summarizeRanges = require('./fragmentation.js');
const inspectSidecars = require('./sidecars.js');

class StorageReport {
	constructor(db) {
		this.db = db;
	}

	snapshot(options = {}) {
		const verify = options.verify !== false;
		const base = this.db.storageStats();
		const persistedRanges = this.db.allocator?.freeList || [];
		const verification = verify ? this.db.verify() : null;
		const persistedFree = summarizeRanges(persistedRanges);
		const verifiedFree = summarizeRanges(verification?.free || []);
		const reachableBytes = Number(verification?.reachableBytes || 0);
		const logicalBytes = Number(base.logicalBytes || 0);
		const physicalBytes = Number(base.physicalBytes || 0);
		const trailingPhysicalBytes = Math.max(0, physicalBytes - logicalBytes);
		const reclaimableBytes = verification?.ok ? verifiedFree.bytes + trailingPhysicalBytes : 0;

		return {
			path: this.db.pager.filePath,
			capturedAt: new Date().toISOString(),
			mode: this.db.options?.readOnly ? 'strict-read-only' : 'writable',
			physicalBytes,
			logicalBytes,
			reachableBytes,
			unreachableLogicalBytes: verification?.ok ? Math.max(0, logicalBytes - reachableBytes) : null,
			trailingPhysicalBytes,
			reclaimableBytes,
			persistedFree,
			verifiedFree,
			verification: verification ? {
				ok: verification.ok,
				errors: verification.errors,
				reachableRanges: verification.reachableRanges
			} : { ok: null, skipped: true },
			reuseVerification: this.db.allocator?.reuseVerification || null,
			sidecars: inspectSidecars(this.db.pager.filePath),
			vacuum: {
				inPlaceAllowed: false,
				outOfPlaceCandidate: verification?.ok === true,
				requiresSemanticComparison: true,
				requiresExclusiveSwapGate: true
			}
		};
	}
}

module.exports = StorageReport;
