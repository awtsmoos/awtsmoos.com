//B"H
//Blessed is He
//Boruch Hashem

/**
 * @file core/allocator/complementTrust.js
 * @chapter The Court Remembers What It Already Proved
 * @description
 * Trust bookkeeping for the verified free-list complement, extracted
 * from freeSpaceOps.js (db-hardening 2026-10-20, 120-line rule).
 * `hasCompleteComplement` reports whether the allocator's free list
 * is already the fully verified reachable complement.
 * `trustAllocation` re-stamps trust after an allocation takes space
 * from the verified list. `requestInitialComplement` flags the
 * allocator for a complement refresh when growth outruns discovery.
 * All three are pure bookkeeping: they move no bytes.
 */

const { markTrusted } = require('./verifiedReuseGate.js');

/**
 * True when the free list is the fully verified complement.
 * @param {object} allocator - AllocatorChesed instance.
 * @returns {boolean} Complement completeness.
 */
function hasCompleteComplement(allocator) {
	return allocator.reuseVerification?.state === 'verified-complete-complement';
}

/**
 * Re-stamps the trusted signature after an allocation consumed
 * verified free space.
 * @param {object} allocator - AllocatorChesed instance.
 * @param {boolean} completeBefore - complement state before allocation.
 * @returns {void}
 */
function trustAllocation(allocator, completeBefore) {
	if (allocator.db.options?.reuseFreedSpace !== 'verified') return;
	markTrusted(allocator, completeBefore
		? 'verified-complete-complement' : 'verified-after-allocation');
}

/**
 * Flags the allocator to (re)compute its verified complement.
 * @param {object} allocator - AllocatorChesed instance.
 * @param {boolean} completeBefore - complement state before allocation.
 * @returns {void}
 */
function requestInitialComplement(allocator, completeBefore) {
	if (allocator._savingFreeList || completeBefore) return;
	if (allocator.db.options?.reuseFreedSpace === 'verified') {
		allocator._needsComplementRefresh = true;
	}
}

module.exports = { hasCompleteComplement, trustAllocation, requestInitialComplement };
