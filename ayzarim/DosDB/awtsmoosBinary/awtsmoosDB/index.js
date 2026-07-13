// B"H

/**
 * @file index.js
 * @chapter The Ancient Door Reopens With Every Persisted Watchtower Remembered
 * @description Compatibility facade for index caches, strict search, batched drains, reports, and vacuum.
 */

const AwtsmoosDB = require('./database.js');
const SearchManager = require('./api/search/index.js');
const StorageReport = require('./api/admin/storageReport.js');
const hydrateIndexCaches = require('./api/indexCacheHydrator.js');
const runIndexedSearch = require('./api/search/strictQuery.js');
const reindexSearch = require('./api/search/reindex/index.js');
const flushSearchPath = require('./api/search/batchedFlush.js');
const vacuumFile = require('./core/vacuum/index.js');
const semanticDigest = require('./core/vacuum/semanticDigest.js');

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
