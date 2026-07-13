// B"H

/**
 * @file core/idle/index.js
 * @chapter Derived Truth Settles Before The Verified Void Is Sealed
 * @description
 * Completes one durability boundary in ownership order: pending writes, derived
 * indexes, complete reachable complement, free-list metadata, superblock, fsync.
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
