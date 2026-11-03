// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/allocator/rangeTrust.js
 * @chapter A Range Is Judged At The Gate Where It Asks To Serve
 * @description
 * Incremental free-range trust (db-phase2, audit sections 5.3.1-5.3.2).
 *
 * The pre-existing verified gate judges the PERSISTED free list with one
 * full reachability walk (db.verify()) before any of it may be reused.
 * That stays the law for seal-loaded ranges: nothing in this module ever
 * promotes a persisted claim without the gate.
 *
 * What this module adds is per-range judgment for ranges whose freedom
 * is established WITHOUT the walk, so a store whose persisted list is
 * unverifiable (or simply not yet verified) no longer degrades to
 * append-only for space this very process freed:
 *
 *   - SESSION POOL (`allocator._sessionFreeList`): ranges released by
 *     this process through free()/releasePointer() while the gate was
 *     closed. Provenance is the release itself — the same trust basis
 *     retirementQueue.promote() already documents for batched frees.
 *     They are ALSO recorded in the durable pending ledger
 *     (pendingFreeList.js), so a crash never loses the accounting.
 *   - DEFERRED SPILL (`allocator._deferredFreeList`): ranges a verified
 *     complement adoption had to drop for SHAPE reasons only — dust
 *     below the 64 B reuse floor and overflow beyond the 65,536-range
 *     adoption cap (reachableComplement.adoptComplement). Their freedom
 *     was proven by the verify that produced the complement; dropping
 *     them permanently was pure loss. They wait here and are retried.
 *
 * A range leaves a pool only through `takeProvenRange()`, which first
 * re-validates the exact candidate locally (validateRangeForReuse):
 * bounds, allocation-lease overlap, protected singleton regions (the
 * superblock and the live root / free-list seal bodies), and
 * disjointness from the main free list and the sibling pool. A refused
 * candidate is quarantined (rejectedFreeList + telemetry) and the
 * caller falls back to the next candidate or to appending — a corrupt
 * range is never written over live data.
 *
 * One-pool invariant: a range lives in exactly one of {freeList,
 * session pool, deferred spill, pending ledger}. Wholesale complement
 * adoptions (idle refresh, gc) subsume both pools and clear them;
 * pending promotion prunes pool entries the free list now covers.
 */

const coalesceFreeRanges = require('./freeRangeCoalescing.js');
const insertFreeRange = coalesceFreeRanges.insertFreeRange;
const Pointer = require('../../utils/pointer/crown.js');

const MAX_REFUSALS_PER_ALLOCATION = 8;

function counters(allocator) {
	if (!allocator._freeSpaceCounters) {
		allocator._freeSpaceCounters = {
			sessionFreedRecorded: 0,
			sessionReused: 0,
			dustDeferred: 0,
			dustDeferredBytes: 0,
			overflowDeferred: 0,
			overflowDeferredBytes: 0,
			spillReused: 0,
			refusedAtReuse: 0
		};
	}
	return allocator._freeSpaceCounters;
}

function sessionPool(allocator) {
	if (!Array.isArray(allocator._sessionFreeList)) allocator._sessionFreeList = [];
	return allocator._sessionFreeList;
}

function deferredPool(allocator) {
	if (!Array.isArray(allocator._deferredFreeList)) allocator._deferredFreeList = [];
	return allocator._deferredFreeList;
}

function overlaps(a, b) {
	return a.offset < b.offset + b.length && b.offset < a.offset + a.length;
}

/**
 * Records a range this process freed while the verified gate was
 * closed. Never throws: a double-free shaped overlap downgrades the
 * record to the quarantine list instead of crashing the caller's free.
 * @param {object} allocator - AllocatorChesed instance.
 * @param {number} offset - Freed range offset.
 * @param {number} length - Freed range length.
 * @returns {boolean} True when recorded in the session pool.
 */
function recordSessionFree(allocator, offset, length) {
	try {
		allocator._sessionFreeList = insertFreeRange(
			sessionPool(allocator), { offset, length }, allocator.cursor);
		counters(allocator).sessionFreedRecorded++;
		return true;
	} catch (error) {
		quarantine(allocator, { offset, length }, `session-record:${error.code || 'overlap'}`);
		return false;
	}
}

/**
 * Deposits a complement-proven range the adoption shaping could not
 * keep (dust or overflow) into the deferred spill instead of dropping
 * it permanently.
 * @param {object} allocator - AllocatorChesed instance.
 * @param {object} range - { offset, length } proven-free range.
 * @param {string} kind - 'dust' | 'overflow'.
 * @returns {boolean} True when deposited.
 */
function depositDeferred(allocator, range, kind) {
	const tally = counters(allocator);
	try {
		allocator._deferredFreeList = insertFreeRange(
			deferredPool(allocator),
			{ offset: range.offset, length: range.length },
			allocator.cursor);
	} catch (error) {
		quarantine(allocator, range, `deferred-record:${error.code || 'overlap'}`);
		return false;
	}
	if (kind === 'dust') {
		tally.dustDeferred++;
		tally.dustDeferredBytes += range.length;
	} else {
		tally.overflowDeferred++;
		tally.overflowDeferredBytes += range.length;
	}
	return true;
}

/**
 * Moves a refused range into the quarantine record with its reason.
 * @param {object} allocator - AllocatorChesed instance.
 * @param {object} range - { offset, length } refused range.
 * @param {string} reason - Refusal reason label.
 * @returns {void}
 */
function quarantine(allocator, range, reason) {
	if (!Array.isArray(allocator.rejectedFreeList)) allocator.rejectedFreeList = [];
	allocator.rejectedFreeList.push({
		offset: range.offset, length: range.length, reason, at: Date.now()
	});
	counters(allocator).refusedAtReuse++;
}

/**
 * Decodes a raw seal pointer buffer into a protected { offset, length }
 * region, or returns null when unavailable/undecodable.
 * @param {Buffer} raw - Raw pointer bytes from the database handle.
 * @returns {object|null} Protected region or null.
 */
function protectedRegion(raw) {
	if (!raw) return null;
	try {
		const decoded = Pointer.decode(raw);
		if (decoded && Number.isSafeInteger(decoded.offset) && decoded.length > 0) {
			return { offset: decoded.offset, length: decoded.length };
		}
	} catch (_error) { /* an undecodable seal protects nothing extra */ }
	return null;
}

/**
 * Local witnesses for one candidate range, checked at reuse time:
 * shape/bounds, allocation leases, the superblock, the live root-seal
 * and free-list-seal bodies, and disjointness from the main free list.
 * This never claims to prove an arbitrary persisted range free — that
 * remains the verified gate's office. It proves that a PROVENANCE-known
 * candidate (session-freed or complement-deferred) still names space
 * nothing live can occupy.
 * @param {object} allocator - AllocatorChesed instance.
 * @param {object} range - { offset, length } candidate.
 * @returns {object} { ok: true } or { ok: false, reason }.
 */
function validateRangeForReuse(allocator, range) {
	if (!range
		|| !Number.isSafeInteger(range.offset)
		|| !Number.isSafeInteger(range.length)
		|| range.length <= 0
		|| range.offset < 64
		|| range.offset + range.length > allocator.cursor) {
		return { ok: false, reason: 'out-of-bounds' };
	}
	for (const lease of allocator._allocationLeases.values()) {
		if (overlaps(range, lease)) return { ok: false, reason: 'overlaps-allocation-lease' };
	}
	const db = allocator.db || {};
	for (const raw of [db.freeListPtrRaw, db.rootPtrRaw, db.rootSealPtrRaw]) {
		const region = protectedRegion(raw);
		if (region && overlaps(range, region)) {
			return { ok: false, reason: 'overlaps-seal-body' };
		}
	}
	for (const freeRange of allocator.freeList || []) {
		if (freeRange === range) continue;
		if (overlaps(range, freeRange)) {
			return { ok: false, reason: 'overlaps-free-list' };
		}
	}
	return { ok: true };
}

/**
 * Best-fit peek over a pool without mutating it. Mirrors the preference
 * order of freeRangeSelection.chooseFreeRange (exact fit, then
 * fragment-penalty class, then smallest length, then lowest offset).
 * @param {Array<object>} ranges - Sorted pool ranges.
 * @param {number} size - Requested bytes.
 * @param {number} minimumFragment - Fragment penalty floor.
 * @returns {number} Index of the chosen range, or -1.
 */
function peekBestFit(ranges, size, minimumFragment) {
	let bestIndex = -1;
	let bestPenalty = 0;
	let bestLength = 0;
	for (let index = 0; index < ranges.length; index++) {
		const range = ranges[index];
		if (range.length < size) continue;
		if (range.length === size) return index;
		const remainder = range.length - size;
		const penalty = remainder > 0 && remainder < minimumFragment ? 1 : 0;
		if (bestIndex < 0
			|| penalty < bestPenalty
			|| (penalty === bestPenalty && range.length < bestLength)) {
			bestIndex = index;
			bestPenalty = penalty;
			bestLength = range.length;
		}
	}
	return bestIndex;
}

/**
 * Consumes `size` bytes from the front of ranges[index] (the split
 * semantics of chooseFreeRange) and returns the location.
 * @param {Array<object>} ranges - Sorted pool ranges (mutated).
 * @param {number} index - Chosen range index.
 * @param {number} size - Requested bytes.
 * @returns {object} { offset, length } allocation location.
 */
function consumeAt(ranges, index, size) {
	const selected = ranges[index];
	const location = { offset: selected.offset, length: size };
	selected.offset += size;
	selected.length -= size;
	if (selected.length === 0) ranges.splice(index, 1);
	return location;
}

/**
 * Attempts one allocation from a provenance pool: peek the best fit,
 * validate the exact candidate locally, consume on success, quarantine
 * + retry the next candidate on refusal (bounded).
 * @param {object} allocator - AllocatorChesed instance.
 * @param {Array<object>} pool - Session or deferred pool (mutated).
 * @param {number} size - Requested bytes.
 * @param {string} tallyKey - Counter to increment on success.
 * @returns {object|null} Location or null when the pool cannot serve.
 */
function takeFromPool(allocator, pool, size, tallyKey) {
	const minimumFragment = Number(allocator.db.options?.minimumFreeFragment || 64);
	let refusals = 0;
	while (refusals <= MAX_REFUSALS_PER_ALLOCATION) {
		const index = peekBestFit(pool, size, minimumFragment);
		if (index < 0) return null;
		const source = pool[index];
		const candidate = { offset: source.offset, length: size };
		const verdict = validateRangeForReuse(allocator, candidate);
		if (verdict.ok) {
			const location = consumeAt(pool, index, size);
			counters(allocator)[tallyKey]++;
			return location;
		}
		pool.splice(index, 1);
		quarantine(allocator, source, verdict.reason);
		refusals++;
	}
	return null;
}

/**
 * Serves an allocation from the deferred spill first (complement-proven
 * space), then from the session pool (locally freed space). Called only
 * in verified mode after the gated free list could not serve.
 * @param {object} allocator - AllocatorChesed instance.
 * @param {number} size - Requested bytes.
 * @returns {object|null} Location or null (caller appends at cursor).
 */
function takeProvenRange(allocator, size) {
	const spill = takeFromPool(allocator, deferredPool(allocator), size, 'spillReused');
	if (spill) return spill;
	return takeFromPool(allocator, sessionPool(allocator), size, 'sessionReused');
}

/**
 * Removes pool entries the main free list now covers (one-pool
 * invariant after pending promotion adopted overlapping ranges).
 * @param {object} allocator - AllocatorChesed instance.
 * @returns {void}
 */
function prunePoolsAgainstFreeList(allocator) {
	const freeList = allocator.freeList || [];
	if (!freeList.length) return;
	const prune = pool => pool.filter(range =>
		!freeList.some(freeRange => overlaps(range, freeRange)));
	allocator._sessionFreeList = prune(sessionPool(allocator));
	allocator._deferredFreeList = prune(deferredPool(allocator));
}

/**
 * Clears both derived pools: a wholesale verified-complement adoption
 * (idle refresh or gc) subsumes every still-free pool range.
 * @param {object} allocator - AllocatorChesed instance.
 * @returns {void}
 */
function clearDerivedPools(allocator) {
	allocator._sessionFreeList = [];
	allocator._deferredFreeList = [];
}

module.exports = {
	clearDerivedPools,
	counters,
	deferredPool,
	depositDeferred,
	prunePoolsAgainstFreeList,
	recordSessionFree,
	sessionPool,
	takeProvenRange,
	validateRangeForReuse
};
