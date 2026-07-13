// B"H

/**
 * @file api/vector/hnsw/registry.js
 * @chapter One Generation Writes Every Final Node Exactly Once
 * @description
 * Keeps dirty graph nodes authoritative in memory, seals each final body once,
 * links one registry generation, and only then retires original persisted bodies.
 */

const pointerOps = require('./registryPointers.js');

class HNSWRegistry {
	constructor(hnsw, handle) {
		this.hnsw = hnsw;
		this.handle = handle;
		this.cache = new Map();
		this.dirtyNodes = new Map();
		this._ptrs = [];
		this.initialized = false;
		this.bulk = false;
		this.bulkOriginal = null;
	}

	init() {
		if (this.initialized) return;
		this._ptrs = pointerOps.read(this.hnsw, this.handle);
		this.initialized = true;
	}

	beginBulk() {
		this.init();
		if (this.bulk) return;
		this.bulk = true;
		this.bulkOriginal = this._ptrs.slice();
		this.dirtyNodes.clear();
	}

	commitBulk() {
		if (!this.bulk) return;
		const written = [];
		try {
			for (const [id, node] of this.sortedDirtyNodes()) {
				const pointer = this.hnsw.storage.saveNode(node);
				node.ptr = pointer;
				this._ptrs[id] = pointer;
				written.push(pointer);
			}
			pointerOps.replace(this.hnsw, this.handle, this._ptrs);
		} catch (error) {
			this.releaseUnlinked(written);
			this.restoreOriginalState();
			throw error;
		}
		this.retireOriginalBodies();
		this.clearBulkState();
	}

	abortBulk() {
		this.restoreOriginalState();
	}

	restoreOriginalState() {
		if (this.bulkOriginal) this._ptrs = this.bulkOriginal.slice();
		this.dirtyNodes.clear();
		this.cache.clear();
		this.clearBulkState();
	}

	clearBulkState() {
		this.bulk = false;
		this.bulkOriginal = null;
		this.dirtyNodes.clear();
	}

	count() {
		this.init();
		return this._ptrs.length;
	}

	getNode(id) {
		this.init();
		if (!Number.isInteger(id) || id < 0 || id >= this._ptrs.length) return null;
		if (this.dirtyNodes.has(id)) return this.dirtyNodes.get(id);
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
		if (this.bulk) {
			if (node.id >= this._ptrs.length) this._ptrs.length = node.id + 1;
			this.dirtyNodes.set(node.id, node);
			this.cacheNode(node.id, node);
			return node.ptr || this._ptrs[node.id] || null;
		}
		const previous = this._ptrs[node.id];
		const pointer = this.hnsw.storage.saveNode(node);
		node.ptr = pointer;
		this._ptrs[node.id] = pointer;
		this.cacheNode(node.id, node);
		pointerOps.persist(this.hnsw, this.handle, node.id, pointer);
		if (previous) pointerOps.release(this.hnsw, previous, pointer);
		return pointer;
	}

	sortedDirtyNodes() {
		return Array.from(this.dirtyNodes.entries()).sort((left, right) => left[0] - right[0]);
	}

	retireOriginalBodies() {
		for (const [id] of this.sortedDirtyNodes()) {
			const previous = this.bulkOriginal?.[id];
			const current = this._ptrs[id];
			if (previous) pointerOps.release(this.hnsw, previous, current);
		}
	}

	releaseUnlinked(pointers) {
		for (const pointer of pointers) pointerOps.release(this.hnsw, pointer, null);
	}
}

module.exports = HNSWRegistry;
