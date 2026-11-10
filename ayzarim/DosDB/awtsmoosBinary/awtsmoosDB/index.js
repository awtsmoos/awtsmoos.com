// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @chapter The Public Door Opens With Verified Memory Of Every Reclaimable Chamber
 * @description
 * Compatibility facade for strict search, reports, vacuum, and safe defaults.
 * Writable callers that omit a reuse policy now receive verified reuse; explicit
 * opt-out and read-only choices remain unchanged beneath the Awtsmoos.
 */

const BaseAwtsmoosDB = require('./database.js');
const SearchManager = require('./api/search/index.js');
const StorageReport = require('./api/admin/storageReport.js');
const hydrateIndexCaches = require('./api/indexCacheHydrator.js');
const runIndexedSearch = require('./api/search/strictQuery.js');
const reindexSearch = require('./api/search/reindex/index.js');
const flushSearchPath = require('./api/search/batchedFlush.js');
const vacuumFile = require('./core/vacuum/index.js');
const semanticDigest = require('./core/vacuum/semanticDigest.js');
const maintenance = require('./api/admin/maintenance.js');
const withDefaultVerifiedReuse = require('./core/allocator/defaultReuseOptions.js');

class AwtsmoosDB extends BaseAwtsmoosDB {
	constructor(filePath, options = {}) {
		super(filePath, withDefaultVerifiedReuse(options));
	}
}

// B"H: dead-space choke point. Every writable handle opened through this
// facade registers its file here; one unref'd timer per file periodically
// flushes and runs the throttled free-space adoption, so freed space is
// recycled for EVERY store by construction — no per-store wiring to forget.
// The helper module instance is shared with the DosDB adapter (same resolved
// path), so its per-file throttle dedupes against the adapter's own calls.
// Explicit reuse opt-outs (reuseFreedSpace:false) and read-only handles are
// respected, never overridden.
let maintainFreeSpaceThrottled = null;
try {
	maintainFreeSpaceThrottled = require('../../awtsmoosDbMaintenance.js').maintainFreeSpaceThrottled;
} catch (error) {
	maintainFreeSpaceThrottled = null;
}
const MAINT_INTERVAL_MS = Math.max(1000, parseInt(process.env.AWTSMOOS_MAINT_INTERVAL_MS || '300000', 10) || 300000);
const maintHandles = new Map(); // filePath -> Set<db>
const maintTimers = new Map(); // filePath -> timer

function armMaintenance(db) {
	if (typeof maintainFreeSpaceThrottled !== 'function') return;
	const file = db && db.pager && db.pager.filePath;
	if (!file || !db.options || db.options.readOnly) return;
	if (db.options.reuseFreedSpace !== 'verified' && db.options.reuseFreedSpace !== true) return;
	let set = maintHandles.get(file);
	if (!set) { set = new Set(); maintHandles.set(file, set); }
	set.add(db);
	// VirtualFs replaces db.close per instance (api/fs/v3/VirtualFs.js), so a
	// prototype close wrapper would be bypassed. Wrap the instance's own
	// close once, composing over whatever it currently is, to deregister.
	if (typeof db.close === 'function' && !db.__maintCloseWrapped) {
		db.__maintCloseWrapped = true;
		const innerClose = db.close;
		db.close = function closeWithMaintenanceCleanup(...closeArgs) {
			try {
				return innerClose.apply(this, closeArgs);
			} finally {
				const liveSet = maintHandles.get(file);
				if (liveSet) {
					liveSet.delete(db);
					if (liveSet.size === 0) {
						maintHandles.delete(file);
						const timer = maintTimers.get(file);
						if (timer) clearTimeout(timer);
						maintTimers.delete(file);
					}
				}
			}
		};
	}
	if (maintTimers.has(file)) return;
	const tick = () => {
		const live = maintHandles.get(file);
		const handle = live && [...live][0];
		if (!handle) { maintTimers.delete(file); return; }
		try { if (handle.fs && typeof handle.fs.flush === 'function') handle.fs.flush(); } catch (error) { /* never throws */ }
		try { maintainFreeSpaceThrottled(handle, file); } catch (error) { /* helper never throws; belt and braces */ }
		if (maintHandles.has(file)) {
			const next = setTimeout(tick, MAINT_INTERVAL_MS);
			if (next.unref) next.unref();
			maintTimers.set(file, next);
		} else {
			maintTimers.delete(file);
		}
	};
	const first = setTimeout(tick, MAINT_INTERVAL_MS);
	if (first.unref) first.unref();
	maintTimers.set(file, first);
}

const originalOpen = AwtsmoosDB.prototype.open;
AwtsmoosDB.prototype.open = function openWithIndexCaches(...argumentsList) {
	const result = originalOpen.apply(this, argumentsList);
	if (result && typeof result.then === 'function') {
		return result.then(value => {
			hydrateIndexCaches(this);
			armMaintenance(this);
			return value;
		});
	}
	hydrateIndexCaches(this);
	armMaintenance(this);
	return result;
};


SearchManager.prototype.runIndexed = function runIndexed(handleOrPath, query) {
	return runIndexedSearch(this, handleOrPath, query);
};

SearchManager.prototype.reindex = function rebuildSearchIndex(path) {
	return reindexSearch(this, path);
};

SearchManager.prototype._flushUpdates = function flushUpdatesInOneBoundary(path) {
	return flushSearchPath(this, path);
};

AwtsmoosDB.prototype.storageReport = function storageReport(options = {}) {
	return new StorageReport(this).snapshot(options);
};

// B"H §8.3: scheduled reclamation. maintenanceGc runs gc() + a health
// check synchronously under the caller's exclusive ownership;
// scheduleMaintenanceGc defers it out of the request path.
AwtsmoosDB.prototype.maintenanceGc = function maintenanceGc(options = {}) {
	return maintenance.runMaintenanceGc(this, options);
};

AwtsmoosDB.prototype.scheduleMaintenanceGc = function scheduleMaintenanceGc(options = {}) {
	return maintenance.scheduleMaintenanceGc(this, options);
};

AwtsmoosDB.prototype.checkStorageHealth = function checkStorageHealth(options = {}) {
	return maintenance.checkStorageHealth(this, options);
};

AwtsmoosDB.prototype.semanticDigest = function digest() {
	return semanticDigest(this);
};

AwtsmoosDB.vacuumFile = function vacuum(sourcePath, destinationPath, options = {}) {
	return vacuumFile(AwtsmoosDB, sourcePath, destinationPath, options);
};

module.exports = AwtsmoosDB;
