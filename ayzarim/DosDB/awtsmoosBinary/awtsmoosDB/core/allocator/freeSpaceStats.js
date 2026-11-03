// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/allocator/freeSpaceStats.js
 * @chapter The Ledger Announces Its Own Decay
 * @description
 * Free-space telemetry (db-phase2, audit section 5.3.2). Before this
 * call existed, allocator degradation was invisible: ranges dropped by
 * complement shaping vanished silently, a quarantined persisted list
 * announced itself nowhere, and the only symptom was a store growing
 * append-only. `allocator.freeSpaceStats()` (surfaced as
 * `db.info().freeSpace`) reports every pool's ranges/bytes, the
 * quarantine, and the cumulative drop/refusal counters, so degradation
 * is a number an operator (or a watchdog) can watch.
 */

const rangeTrust = require('./rangeTrust.js');
const pendingFreeList = require('./pendingFreeList.js');

function shape(ranges) {
	const list = Array.isArray(ranges) ? ranges : [];
	return {
		ranges: list.length,
		bytes: list.reduce((sum, range) => sum + (range.length || 0), 0)
	};
}

/**
 * Builds the free-space telemetry snapshot for one allocator.
 * @param {object} allocator - AllocatorChesed instance.
 * @returns {object} Telemetry: mode, trust state, per-pool ranges/bytes,
 *   quarantine size, active lease count, cumulative counters.
 */
function freeSpaceStats(allocator) {
	const pending = pendingFreeList.load(allocator);
	return {
		mode: allocator.db.options?.reuseFreedSpace ?? null,
		reuseState: allocator.reuseVerification?.state || 'unknown',
		reuseOk: allocator.reuseVerification?.ok ?? null,
		active: shape(allocator.freeList),
		session: shape(rangeTrust.sessionPool(allocator)),
		deferred: shape(rangeTrust.deferredPool(allocator)),
		pending: shape(pending),
		quarantined: {
			ranges: (allocator.rejectedFreeList || []).length
				+ (allocator.rejectedRetiredRanges || []).length
		},
		leases: allocator._allocationLeases ? allocator._allocationLeases.size : 0,
		counters: { ...rangeTrust.counters(allocator) }
	};
}

module.exports = freeSpaceStats;
