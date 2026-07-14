// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/idle/index.js
 * @chapter Derived Truth Settles Before The Verified Void Is Sealed
 * @description
 * Completes one durability boundary in ownership order: pending writes, derived
 * indexes, reachability-checked local retirements, complete verified complement,
 * free-list metadata, superblock, and fsync. The Awtsmoos permits no former
 * chamber to return before every replacement structure stands fully linked.
 */

const shouldSkipForcedFsync = require('./fastGate.js');
const drainIndexOps = require('./drainIndexOps.js');
const flushSearch = require('./flushSearch.js');

function waitForIdle(db, options = {}) {
	const previousIdleState = Boolean(db._insideWaitForIdle);
	db._insideWaitForIdle = true;
	try {
		if (db.turbo && typeof db.turbo.flush === 'function') db.turbo.flush();
		drainIndexOps(db);
		flushSearch(db);
		if (db.allocator && typeof db.allocator.promoteRetiredRanges === 'function') {
			db.allocator.promoteRetiredRanges();
		}
		if (db.allocator && typeof db.allocator.refreshVerifiedFreeList === 'function') {
			db.allocator.refreshVerifiedFreeList();
		}
		if (db.allocator && typeof db.allocator.flushPendingFreeList === 'function') {
			db.allocator.flushPendingFreeList();
		}
		db._flushSuperblock();
		if (!shouldSkipForcedFsync(options)) db.pager.fsync(true);
	} finally {
		db._insideWaitForIdle = previousIdleState;
	}
}

module.exports = waitForIdle;
