// B"H

/**
 * @file api/vector/hnsw.js
 * @chapter The Graph Facade Delegates Growth While Preserving Living Roads
 * @description Coordinates storage, registry, key identity, protected backbone,
 * deterministic insertion, strict search, and deletion-time bridge repair.
 */

const VectorMath = require('./math.js');
const VectorStorage = require('./storage.js');
const HNSWRegistry = require('./hnsw/registry.js');
const HNSWKeyIndex = require('./hnsw/keyIndex.js');
const HNSWOps = require('./hnsw/ops.js');
const HNSWBackbone = require('./hnsw/backbone.js');
const HNSWInserter = require('./hnsw/inserter.js');
const searchGraph = require('./hnsw/query.js');

class HNSW {
	constructor(database, registryHandle, keyMapHandle, metadata) {
		this.db = database;
		this.registry = new HNSWRegistry(this, registryHandle);
		this.keyMap = keyMapHandle;
		this.keys = new HNSWKeyIndex(this, keyMapHandle, this.registry);
		this.meta = metadata;
		this.storage = new VectorStorage(database.allocator);
		this.metric = VectorMath[metadata.metric] || VectorMath.cosine;
		this.entryNodeID = metadata.entryNodeID ?? -1;
		this.maxLevel = Number(metadata.maxLevel || 0);
		this.M = 16;
		this.M0 = 32;
		this.efConstruction = 200;
		this.efSearch = 256;
		this.ml = 1 / Math.log(this.M);
		this.ops = new HNSWOps(this);
		this.backbone = new HNSWBackbone(this);
		this.inserter = new HNSWInserter(this);
		this.onEntryPointChanged = null;
	}

	insert(key, vector, payloadPointer) {
		return this.inserter.insert(key, vector, payloadPointer);
	}

	updateEntryPoint(node) {
		this.entryNodeID = node.id;
		this.maxLevel = node.level;
		this.meta.entryNodeID = node.id;
		this.meta.maxLevel = node.level;
		this.onEntryPointChanged?.(node.id, node.level);
	}

	search(queryVector, count = 5) {
		return searchGraph(this, queryVector, count);
	}

	delete(key) {
		const textKey = String(key);
		const id = this.keys.get(textKey);
		if (id === undefined || id === null) return false;
		const node = this.registry.getNode(Number(id));
		if (!node || node.deleted) return false;
		node.deleted = true;
		this.registry.saveNode(node);
		this.backbone.bridge(node);
		this.keys.remove(textKey);
		return true;
	}
}

module.exports = HNSW;
