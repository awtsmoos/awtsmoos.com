// B"H

/**
 * @file core/allocator/reachableComplement.js
 * @chapter The Verified Void Is Adopted Only At The Outermost Rest
 * @description Replaces partial free claims with the full reachable complement after every live mutation is linked.
 */

const coalesceFreeRanges = require('./freeRangeCoalescing.js');
const cursorState = require('./cursorState.js');
const { markTrusted } = require('./verifiedReuseGate.js');

function refreshVerifiedComplement(allocator) {
	if (!shouldRefresh(allocator)) return { refreshed: false, skipped: true };
	const report = allocator.db.verify();
	if (!report?.ok) return rejectVerification(allocator, report);
	const previousSignature = rangeSignature(allocator.freeList);
	const previousCursor = allocator.cursor;
	allocator.freeList = coalesceFreeRanges(report.free || [], allocator.cursor);
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
		freeRanges: allocator.freeList.length,
		freeBytes: allocator.freeList.reduce((sum, range) => sum + range.length, 0)
	};
}

function shouldRefresh(allocator) {
	const db = allocator.db;
	return db.options?.reuseFreedSpace === 'verified'
		&& !db.options?.readOnly
		&& !allocator.legacySuperblockless
		&& !allocator._savingFreeList
		&& db._insideWaitForIdle === true
		&& db.pager?.isBatching !== true
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
