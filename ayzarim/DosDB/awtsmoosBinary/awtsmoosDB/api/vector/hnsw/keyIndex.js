// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/hnsw/keyIndex.js
 * @chapter Living Vector Names Stay Readable Inside One Binary Ledger
 * @description Hydrates packed or legacy ledgers into memory, persists ordinary
 * mutations as one bounded buffer, and delegates bulk replacement as one seal.
 */

const ledger = require('./keyLedger.js');
const bulk = require('./keyIndexBulk.js');

class HNSWKeyIndex {
	constructor(hnsw, handle, registry) {
		this.hnsw = hnsw;
		this.handle = handle;
		this.registry = registry;
		this.cache = new Map();
		this.hydrated = false;
		this.bulk = false;
		this.bulkOriginal = null;
		this.bulkEntries = null;
	}

	beginBulk(options = {}) {
		bulk.begin(this, options);
	}

	commitBulk() {
		bulk.commit(this);
	}

	abortBulk() {
		bulk.abort(this);
	}

	set(key, id) {
		this.hydrate();
		const text = String(key);
		const numericId = Number(id);
		this.cache.set(text, numericId);
		if (this.bulk) {
			this.bulkEntries.set(text, numericId);
			return numericId;
		}
		bulk.persist(this, this.cache);
		return numericId;
	}

	get(key) {
		this.hydrate();
		return this.cache.get(String(key));
	}

	entries() {
		if (this.bulk) return Array.from(this.bulkEntries.entries());
		this.hydrate();
		return Array.from(this.cache.entries());
	}

	persistedEntries() {
		return ledger.entries(this.handle);
	}

	remove(key) {
		this.hydrate();
		const text = String(key);
		const removed = this.cache.delete(text);
		if (!removed) return false;
		if (this.bulk) return this.bulkEntries.delete(text);
		bulk.persist(this, this.cache);
		return true;
	}

	hydrate() {
		if (this.hydrated) return;
		for (const [key, id] of ledger.entries(this.handle)) {
			if (Number.isInteger(id)) this.cache.set(key, id);
		}
		if (!this.cache.size) this.hydrateFromRegistry();
		this.hydrated = true;
	}

	hydrateFromRegistry() {
		for (let id = 0; id < this.registry.count(); id++) {
			const node = this.registry.getNode(id);
			if (node?.key !== undefined) {
				this.cache.set(String(node.key), id);
			}
		}
	}
}

module.exports = HNSWKeyIndex;
