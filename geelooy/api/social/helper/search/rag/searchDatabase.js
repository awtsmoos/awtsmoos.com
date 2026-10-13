// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchDatabase.js
 * @module ReadOnlyRagDatabase
 * @description
 * Strict RAG opens persisted vector and lexical indexes through a physically
 * read-only AwtsmoosDB with a deliberately tiny page cache. Immutable search
 * therefore cannot allocate/free corpus bytes or let many shards multiply RAM.
 */

const BaseAwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/database.js');

// 64KB pages: 128 pages = 8MB per open search database. The persisted HNSW
// graph walk touches hundreds of random pages per query; with only 8 cached
// pages every node visit re-issued a page read and the 28-part
// likkutei-sichos lane could never finish inside the public deadline.
// Read-only search databases never hold dirty pages, so a larger clean-page
// cache is pure read acceleration bounded by the shard session LRU.
const MAX_CACHED_PAGES = 128;

class SearchDatabase extends BaseAwtsmoosDB {
	constructor(filePath) {
		super(filePath, {
			debug: false,
			wal: false,
			readOnly: true,
			maxCachedPages: MAX_CACHED_PAGES,
			processLockMode: 'shared',
			lockMode: 'shared'
		});
	}

	/** Read-only search never needs persisted free-space bookkeeping. */
	_loadFreeListSeal() {
		this.freeListPtrRaw = null;
		this.allocator.freeList = [];
	}
}

module.exports = SearchDatabase;
module.exports.MAX_CACHED_PAGES = MAX_CACHED_PAGES;
