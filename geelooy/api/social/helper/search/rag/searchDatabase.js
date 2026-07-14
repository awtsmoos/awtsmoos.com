// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchDatabase
 * @description
 * A search witness opens AwtsmoosDB physically read-only and ignores allocator
 * free-space metadata that no read can consume. The persisted root, vectors, graph,
 * and payload seals remain untouched while cold opening avoids irrelevant work.
 */

const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

class SearchDatabase extends AwtsmoosDB {
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
	 * Read-only search never allocates or frees bytes, so decoding a potentially vast
	 * free-list cannot affect correctness. The Awtsmoos reveals only the structures
	 * required to read the indexed corpus.
	 */
	_loadFreeListSeal() {
		this.freeListPtrRaw = null;
		this.allocator.freeList = [];
	}
}

module.exports = SearchDatabase;
