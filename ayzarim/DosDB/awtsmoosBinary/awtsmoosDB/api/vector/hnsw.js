// B"H

/**
 * @file api/vector/hnsw.js
 * @chapter The Graph Grows Deterministically And Removes Every Retired Name
 * @description Coordinates insertion and deletion while delegated modules own
 * levels, traversal, storage, registry, living key identity, and neighbor links.
 */

const VectorMath = require('./math.js');
const VectorStorage = require('./storage.js');
const HNSWRegistry = require('./hnsw/registry.js');
const HNSWKeyIndex = require('./hnsw/keyIndex.js');
const HNSWOps = require('./hnsw/ops.js');
const deterministicLevel = require('./hnsw/level.js');
const searchGraph = require('./hnsw/query.js');

class HNSW {
	constructor(db, registryHandle, keyMapHandle, metadata) {
		this.db = db;
		this.registry = new HNSWRegistry(this, registryHandle);
		this.keyMap = keyMapHandle;
		this.keys = new HNSWKeyIndex(keyMapHandle, this.registry);
		this.meta = metadata;
		this.storage = new VectorStorage(db.allocator);
		this.metric = VectorMath[metadata.metric] || VectorMath.cosine;
		this.entryNodeID = metadata.entryNodeID ?? -1;
		this.maxLevel = Number(metadata.maxLevel || 0);
		this.M = 16;
		this.M0 = 32;
		this.efConstruction = 200;
		this.efSearch = 256;
		this.ml = 1 / Math.log(this.M);
		this.ops = new HNSWOps(this);
		this.onEntryPointChanged = null;
	}

	insert(key, vector, payloadPointer) {
		const node = this.createNode(key, vector, payloadPointer);
		if (this.entryNodeID < 0) return this.insertFirstNode(node);
		let entry = this.registry.getNode(this.entryNodeID);
		if (!entry) throw new Error('B"H HNSW entry node could not be loaded');
		this.maxLevel = Math.max(this.maxLevel, Number(entry.level || 0));
		for (let level = this.maxLevel; level > node.level; level--) {
			entry = this.ops.searchLayer(entry, node.vector, 1, level)[0]?.node || entry;
		}
		this.registry.saveNode(node);
		for (let level = Math.min(node.level, this.maxLevel); level >= 0; level--) {
			entry = this.connectLevel(node, entry, level);
		}
		if (node.level > this.maxLevel) this.updateEntryPoint(node);
		this.keys.set(node.key, node.id);
		return node.id;
	}

	insertFirstNode(node) {
		this.registry.saveNode(node);
		this.updateEntryPoint(node);
		this.keys.set(node.key, node.id);
		return node.id;
	}

	connectLevel(node, entry, level) {
		const candidates = this.ops.searchLayer(entry, node.vector, this.efConstruction, level);
		const limit = level === 0 ? this.M0 : this.M;
		const neighbors = candidates.slice(0, limit).map(candidate => candidate.node.id);
		node.neighbors[level] = neighbors;
		this.registry.saveNode(node);
		for (const neighborId of neighbors) {
			const neighbor = this.registry.getNode(neighborId);
			if (neighbor) this.ops.connectNeighbor(neighbor, node.id, level);
		}
		return candidates[0]?.node || entry;
	}

	createNode(key, vector, payloadPointer) {
		const textKey = String(key);
		const level = deterministicLevel(textKey, this.ml);
		return {
			id: this.registry.count(),
			key: textKey,
			level,
			vector,
			payloadPtr: payloadPointer,
			neighbors: Array.from({ length: level + 1 }, () => []),
			deleted: false
		};
	}

	updateEntryPoint(node) {
		this.entryNodeID = node.id;
		this.maxLevel = node.level;
		this.meta.entryNodeID = node.id;
		this.meta.maxLevel = node.level;
		if (this.onEntryPointChanged) this.onEntryPointChanged(node.id, node.level);
	}

	search(queryVector, count = 5) {
		return searchGraph(this, queryVector, count);
	}

	delete(key) {
		const textKey = String(key);
		const id = this.keys.get(textKey);
		if (id === undefined || id === null) return false;
		const node = this.registry.getNode(Number(id));
		if (!node) return false;
		node.deleted = true;
		this.registry.saveNode(node);
		this.keys.remove(textKey);
		return true;
	}
}

module.exports = HNSW;
