// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchDatabase
 * @chapter The Read-Only Search Vessel Opens Only The Roads It Actually Travels
 * @description
 * Strict RAG uses the base AwtsmoosDB directly because it reads persisted vector
 * metadata and HNSW nodes, not the public facade's general index-cache hydrator.
 * The database remains physically read-only, WAL-free, shared-locked, and unable
 * to allocate or reclaim bytes while cold startup avoids unrelated cache scans.
 */

const BaseAwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/database.js');

class SearchDatabase extends BaseAwtsmoosDB {
	constructor(filePath) {
		super(filePath, {
			debug: false,
			wal: false,
			readOnly: true,
			processLockMode: 'shared',
			lockMode: 'shared'
		});
	}

	/**
	 * @description
	 * Read-only search never allocates or frees bytes, so persisted free-space
	 * metadata cannot affect correctness and need not be decoded for a query.
	 */
	_loadFreeListSeal() {
		this.freeListPtrRaw = null;
		this.allocator.freeList = [];
	}
}

module.exports = SearchDatabase;
