//B"H
//Blessed is He
//Boruch Hashem

/**
 * @file core/allocator/freeListVersion.js
 * @chapter Every Change Of The Ledger Bears A Number
 * @description
 * Engine-fix 2026-10-20 (E3): the free list's mutation version counter.
 * Trust in the verified-reuse gate used to be an O(n) string signature
 * of the whole free list, rebuilt on every allocate and every free —
 * ~40 ms per call at ~100k ranges, paid ~80 times per dictionary put.
 * Now every site that assigns or mutates allocator.freeList increments
 * _freeListVersion via bumpFreeListVersion, and the gate stamps
 * _trustedFreeListVersion from it. This module requires nothing, so
 * every allocator module (and database.js) can use it cycle-free.
 */

/**
 * Records one mutation of allocator.freeList.
 * @param {object} allocator - AllocatorChesed instance.
 * @returns {number} The new free-list version.
 */
function bumpFreeListVersion(allocator) {
	allocator._freeListVersion = (allocator._freeListVersion || 0) + 1;
	return allocator._freeListVersion;
}

module.exports = { bumpFreeListVersion };
