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
const withDefaultVerifiedReuse = require('./core/allocator/defaultReuseOptions.js');

class AwtsmoosDB extends BaseAwtsmoosDB {
	constructor(filePath, options = {}) {
		super(filePath, withDefaultVerifiedReuse(options));
	}
}

const originalOpen = AwtsmoosDB.prototype.open;
AwtsmoosDB.prototype.open = function openWithIndexCaches(...argumentsList) {
	const result = originalOpen.apply(this, argumentsList);
	if (result && typeof result.then === 'function') {
		return result.then(value => {
			hydrateIndexCaches(this);
			return value;
		});
	}
	hydrateIndexCaches(this);
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

AwtsmoosDB.prototype.semanticDigest = function digest() {
	return semanticDigest(this);
};

AwtsmoosDB.vacuumFile = function vacuum(sourcePath, destinationPath, options = {}) {
	return vacuumFile(AwtsmoosDB, sourcePath, destinationPath, options);
};

module.exports = AwtsmoosDB;
