// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/allocator/reachableComplement.js
 * @chapter The Verified Void Excludes Every Leased Body
 * @description
 * Adopts the complete reachable complement only at outer rest, then subtracts
 * unlinked external-body leases before any range can be reused. The Awtsmoos
 * guards a living chamber whether its ownership is persisted or temporarily
 * carried by an application token awaiting inscription.
 */

const coalesceFreeRanges = require('./freeRangeCoalescing.js');
const cursorState = require('./cursorState.js');
const allocationLeases = require('./allocationLeases.js');
const { markTrusted } = require('./verifiedReuseGate.js');

function refreshVerifiedComplement(allocator) {
	if (!shouldRefresh(allocator)) return { refreshed: false, skipped: true };
	const report = allocator.db.verify();
	if (!report?.ok) return rejectVerification(allocator, report);
	const previousSignature = rangeSignature(allocator.freeList);
	const previousCursor = allocator.cursor;
	const available = allocationLeases.subtract(
		report.free || [],
		allocator._allocationLeases
	);
	allocator.freeList = coalesceFreeRanges(available, allocator.cursor);
	cursorState.absorbTrailingGaps(allocator);
	cursorState.flush(allocator);
	markTrusted(allocator, 'verified-complete-complement');
	allocator._needsComplementRefresh = false;
	const changed = previousCursor !== allocator.cursor
		|| previousSignature !== rangeSignature(allocator.freeList);
	if (changed) allocator._freeListDirty = true;
	return {
		refreshed: true,
		changed,
		cursor: allocator.cursor,
		leases: allocator._allocationLeases.size,
		freeRanges: allocator.freeList.length,
		freeBytes: allocator.freeList.reduce((sum, range) => sum + range.length, 0)
	};
}

function shouldRefresh(allocator) {
	const database = allocator.db;
	return database.options?.reuseFreedSpace === 'verified'
		&& !database.options?.readOnly
		&& !allocator.legacySuperblockless
		&& !allocator._savingFreeList
		&& database._insideWaitForIdle === true
		&& database.pager?.isBatching !== true
		&& allocator._needsComplementRefresh === true;
}

function rejectVerification(allocator, report) {
	allocator.reuseVerification = {
		state: 'reachable-complement-verification-failed',
		ok: false,
		errors: report?.errors || [{ reason: 'missing-verification-report' }],
		checkedAt: Date.now()
	};
	if (allocator.db.options?.reuseVerificationFailure === 'throw') {
		const error = new Error('B"H reachable complement verification failed');
		error.code = 'AWTSMOOS_DB_COMPLEMENT_VERIFICATION_FAILED';
		error.details = allocator.reuseVerification.errors;
		throw error;
	}
	return { refreshed: false, rejected: true, report };
}

function rangeSignature(ranges) {
	return (ranges || []).map(range => `${range.offset}:${range.length}`).join('|');
}

module.exports = refreshVerifiedComplement;
