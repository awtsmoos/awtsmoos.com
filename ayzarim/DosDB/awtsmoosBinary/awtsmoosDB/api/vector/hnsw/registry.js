// B"H

/**
 * @file api/vector/hnsw/registry.js
 * @chapter The Registry Holds Living Nodes And Delegates Pointer Rituals
 * @description
 * Caches HNSW nodes, supports one-write bulk builds, and delegates raw pointer
 * compatibility, sequence replacement, and safe old-body retirement.
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
	}

	init() {
		if (this.initialized) return;
		this._ptrs = pointerOps.read(this.hnsw, this.handle);
		this.initialized = true;
	}

	beginBulk() {
		this.init();
		this.bulk = true;
	}

	commitBulk() {
		if (!this.bulk) return;
		pointerOps.replace(this.hnsw, this.handle, this._ptrs);
		this.bulk = false;
	}

	abortBulk() {
		this.bulk = false;
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
		if (!this.bulk) pointerOps.persist(this.handle, node.id, pointer);
		pointerOps.release(this.hnsw, previous, pointer);
		return pointer;
	}
}

module.exports = HNSWRegistry;
