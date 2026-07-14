// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/hnsw/keyIndexBulk.js
 * @chapter A Complete Living Key Ledger Replaces Its Empty Vessel Once
 * @description Owns bulk cache lifecycle and installs one packed binary ledger,
 * avoiding both per-key mutations and recursive map-construction generations.
 */

const ledger = require('./keyLedger.js');

function begin(index, options = {}) {
	if (index.bulk) return;
	index.hydrate();
	index.bulk = true;
	index.bulkOriginal = new Map(index.cache);
	index.bulkEntries = options.replace === false
		? new Map(index.cache)
		: new Map();
}

function commit(index) {
	if (!index.bulk) return;
	const entries = new Map(index.bulkEntries || []);
	persist(index, entries);
	index.cache = entries;
	index.hydrated = true;
	clear(index);
}

function persist(index, entries) {
	const root = index.hnsw.db.root.__sys_vector__;
	if (!root) {
		throw new Error(
			'B"H vector metadata root is missing for key-ledger commit'
		);
	}
	root[index.hnsw.meta.mapPath] = ledger.encode(entries);
	index.handle = root[index.hnsw.meta.mapPath];
	index.hnsw.keyMap = index.handle;
}

function abort(index) {
	if (!index.bulk) return;
	index.cache = new Map(index.bulkOriginal || []);
	index.hydrated = true;
	clear(index);
}

function clear(index) {
	index.bulk = false;
	index.bulkOriginal = null;
	index.bulkEntries = null;
}

module.exports = {
	abort,
	begin,
	commit,
	persist
};
