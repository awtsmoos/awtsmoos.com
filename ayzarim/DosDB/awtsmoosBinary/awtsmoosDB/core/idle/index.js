// B"H

/**
 * @file core/idle/index.js
 * @chapter The Outer Boundary Seals Every Deferred Ledger Exactly Once
 * @description
 * Flushes allocator metadata before the superblock, then drains derived indexes,
 * search buffers, and the pager. Batches therefore keep current in-memory free
 * ranges without rewriting their seal during every inner mutation.
 */

const shouldSkipForcedFsync = require('./fastGate.js');
const drainIndexOps = require('./drainIndexOps.js');
const flushSearch = require('./flushSearch.js');

function waitForIdle(db, options = {}) {
	if (db.turbo && typeof db.turbo.flush === 'function') db.turbo.flush();
	if (db.allocator && typeof db.allocator.flushPendingFreeList === 'function') {
		db.allocator.flushPendingFreeList();
	}
	db._flushSuperblock();
	drainIndexOps(db);
	flushSearch(db);
	if (!shouldSkipForcedFsync(options)) db.pager.fsync(true);
}

module.exports = waitForIdle;
