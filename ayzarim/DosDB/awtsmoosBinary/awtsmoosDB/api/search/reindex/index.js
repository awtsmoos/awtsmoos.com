// B"H

/**
 * @file api/search/reindex/index.js
 * @chapter Search Rebuilds Once From Source To Posting Ledger To Balanced Tree
 * @description Coordinates one batched, bottom-up search-index generation.
 */

const collectSourcePointers = require('./sourcePointers.js');
const buildPostingLedger = require('./postingLedger.js');
const buildSearchIndex = require('./indexBuilder.js');

function reindexSearch(manager, path) {
	const textPath = String(path);
	return manager.db.batch(() => {
		const pointers = collectSourcePointers(manager, textPath);
		const ledger = buildPostingLedger(manager, pointers);
		const built = buildSearchIndex(manager, textPath, ledger.postings);
		manager.flush();
		return {
			path: textPath,
			scanned: pointers.length,
			resolvedRecords: ledger.resolvedRecords,
			tokenCount: built.tokenCount,
			postingCount: built.postingCount
		};
	});
}

module.exports = reindexSearch;
