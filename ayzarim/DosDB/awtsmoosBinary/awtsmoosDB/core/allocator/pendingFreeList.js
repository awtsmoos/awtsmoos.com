//B"H
//Blessed is He
//Boruch Hashem

/**
 * @file core/allocator/pendingFreeList.js
 * @chapter No Freed Chamber Is Ever Forgotten Again
 * @description
 * Records free ranges that could not be verified at free() time.
 * Before this module, `free()` in verified mode returned false when `ensureVerified()` failed and the range was SILENTLY DROPPED — dead
 * space was not even recorded (db-investigation 04; the series shard
 * sat at 0 tracked ranges while 359 MB died inside it). Now the range
 * is appended to a durable ledger next to the shard
 * (`<shard>.pending-free.log`, one `offset:length` per line) and
 * held in `allocator.pendingFreeList`. When a later verification
 * succeeds, `promote()` validates each pending range against the
 * verified complement and moves the survivors into the real free list.
 * A pending range is NEVER handed out by allocate() before validation,
 * and a range verification still calls reachable stays pending (never dropped) so the discrepancy stays visible.
 */
const fs = require('fs');
const coalesceFreeRanges = require('./freeRangeCoalescing.js');
const { bumpFreeListVersion } = require('./freeListVersion.js');
const validateFreeRanges = require('./freeRangeValidation.js');

/**
 * Ledger file path for an allocator's shard.
 * @param {object} allocator - AllocatorChesed instance.
 * @returns {string|null} Ledger path, or null when unknown.
 */
function ledgerPath(allocator) {
	const file = allocator?.db?.pager ? allocator.db.pager.filePath : null;
	return file ? `${file}.pending-free.log` : null;
}

/**
 * Loads the persisted pending ledger once per allocator instance.
 * @param {object} allocator - AllocatorChesed instance.
 * @returns {Array<object>} The in-memory pending list.
 */function load(allocator) {
	if (Array.isArray(allocator.pendingFreeList)) return allocator.pendingFreeList;
	allocator.pendingFreeList = [];
	const ledger = ledgerPath(allocator);
	if (ledger) {
		try {
			const text = fs.readFileSync(ledger, 'utf8');
			for (const line of text.split('\n')) {
				const [offset, length] = line.split(':').map(Number);
				if (Number.isSafeInteger(offset) && Number.isSafeInteger(length) && length > 0) {
					allocator.pendingFreeList.push({ offset, length });
				}
			}
		} catch (_) { /* no ledger yet — empty is correct */ }
	}
	return allocator.pendingFreeList;
}

/**
 * Rewrites the ledger with exactly the current pending ranges.
 * @param {object} allocator - AllocatorChesed instance.
 */
function persist(allocator) {
	const ledger = ledgerPath(allocator);
	if (!ledger || allocator.db.options?.readOnly) return;
	const body = (allocator.pendingFreeList || [])
		.map(range => `${range.offset}:${range.length}`).join('\n');
	try {
		if (body) fs.writeFileSync(ledger, body + '\n');
		else fs.rmSync(ledger, { force: true });
	} catch (_) { /* ledger is a safety net, never a crash source */ }
}

/**
 * Records a freed range whose verification is not currently
 * possible. Replaces the old silent drop in freeSpaceOps.free().
 * @param {object} allocator - AllocatorChesed instance.
 * @param {number} offset - freed range offset.
 * @param {number} length - freed range length.
 * @returns {boolean} Always true: the free is durably accounted.
 */function record(allocator, offset, length) {
	const pending = load(allocator);
	allocator.pendingFreeList = coalesceFreeRanges(
		[...pending, { offset, length }], allocator.cursor);
	persist(allocator);
	return true;
}

/**
 * Validates pending ranges against a successful verify report and
 * adopts the survivors into the real free list. Called from the
 * verified-reuse gate whenever verification succeeds (full or
 * partial adoption). Ranges the report still calls reachable stay
 * pending — visible, never silently discarded.
 * @param {object} allocator - AllocatorChesed instance.
 * @param {object} report - verify() report: ok, or degraded (torn-only).
 * @returns {object} { promotedRanges, promotedBytes, stillPending }.
 */function promote(allocator, report) {
	const pending = load(allocator);
	if (!pending.length || !report || (report.ok !== true && report.degraded !== true)) {
		return { promotedRanges: 0, promotedBytes: 0, stillPending: pending.length };
	}
	const result = validateFreeRanges(pending, allocator.cursor, report);
	const survivors = result.validRanges || [];
	if (survivors.length) {
		allocator.freeList = coalesceFreeRanges(
			[...allocator.freeList, ...survivors], allocator.cursor);
		bumpFreeListVersion(allocator);
		const adopted = new Set(survivors.map(r => `${r.offset}:${r.length}`));
		allocator.pendingFreeList = pending.filter(
			range => !adopted.has(`${range.offset}:${range.length}`));
		persist(allocator);
	}
	return {
		promotedRanges: survivors.length,
		promotedBytes: survivors.reduce((sum, r) => sum + r.length, 0),
		stillPending: allocator.pendingFreeList.length
	};
}

module.exports = { ledgerPath, load, record, promote };
