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

const MAX_CACHED_PAGES = 8;

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
