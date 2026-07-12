// B"H

/**
 * @file api/vector/hnsw/registry.js
 * @chapter Detached Builds Reuse Intermediate Bodies While Linked Mutations Wait
 * @description
 * Supports two safe registry transactions: detached construction may retire each
 * superseded body immediately, while linked mutation retires only after commit.
 */

const pointerOps = require('./registryPointers.js');

class HNSWRegistry {
	constructor(hnsw, handle) {
		this.hnsw = hnsw;
		this.handle = handle;
		this.cache = new Map();
		this._ptrs = [];
		this.initialized = false;
		this.bulk = false;
		this.detached = false;
		this.bulkOriginal = null;
		this.bulkRetired = [];
	}

	init() {
		if (this.initialized) return;
		this._ptrs = pointerOps.read(this.hnsw, this.handle);
		this.initialized = true;
	}

	beginBulk(options = {}) {
		this.init();
		if (this.bulk) return;
		this.bulk = true;
		this.detached = options.detached === true;
		this.bulkOriginal = this._ptrs.slice();
		this.bulkRetired = [];
	}

	commitBulk() {
		if (!this.bulk) return;
		pointerOps.replace(this.hnsw, this.handle, this._ptrs);
		if (!this.detached) {
			for (const pair of this.bulkRetired) {
				pointerOps.release(this.hnsw, pair.previous, pair.current);
			}
		}
		this.clearBulkState();
	}

	abortBulk() {
		if (this.detached) this.releaseDetachedCurrentBodies();
		if (this.bulkOriginal) this._ptrs = this.bulkOriginal;
		this.cache.clear();
		this.clearBulkState();
	}

	clearBulkState() {
		this.bulk = false;
		this.detached = false;
		this.bulkOriginal = null;
		this.bulkRetired = [];
	}

	releaseDetachedCurrentBodies() {
		for (let id = 0; id < this._ptrs.length; id++) {
			const current = this._ptrs[id];
			const original = this.bulkOriginal?.[id];
			if (current && (!original || !current.equals(original))) {
				pointerOps.release(this.hnsw, current, original);
			}
		}
	}

	count() {
		this.init();
		return this._ptrs.length;
	}

	getNode(id) {
		this.init();
		if (!Number.isInteger(id) || id < 0 || id >= this._ptrs.length) return null;
		if (this.cache.has(id)) return this.cache.get(id);
		const pointer = this._ptrs[id];
		if (!Buffer.isBuffer(pointer)) return null;
		const node = this.hnsw.storage.loadNode(pointer);
		if (node) this.cacheNode(id, node);
		return node;
	}

	cacheNode(id, node) {
		if (this.cache.size >= 2048) this.cache.delete(this.cache.keys().next().value);
		this.cache.set(id, node);
	}

	saveNode(node) {
		this.init();
		const previous = this._ptrs[node.id];
		const pointer = this.hnsw.storage.saveNode(node);
		node.ptr = pointer;
		this._ptrs[node.id] = pointer;
		this.cacheNode(node.id, node);
		if (!this.bulk) pointerOps.persist(this.hnsw, this.handle, node.id, pointer);
		if (previous) this.retirePrevious(previous, pointer);
		return pointer;
	}

	retirePrevious(previous, current) {
		if (this.bulk && !this.detached) {
			this.bulkRetired.push({ previous, current });
			return;
		}
		pointerOps.release(this.hnsw, previous, current);
	}
}

module.exports = HNSWRegistry;
