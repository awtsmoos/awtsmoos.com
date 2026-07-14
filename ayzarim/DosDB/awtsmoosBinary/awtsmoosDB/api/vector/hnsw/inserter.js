// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/hnsw/inserter.js
 * @chapter Every New Node Joins Similarity Roads And The Protected Backbone
 * @description Creates canonical Float32 nodes, descends graph levels, writes
 * bounded reciprocal similarity edges, and joins the permanent fallback road.
 */

const deterministicLevel = require('./level.js');

class HNSWInserter {
	constructor(hnsw) {
		this.hnsw = hnsw;
	}

	insert(key, vector, payloadPointer) {
		const node = this.createNode(key, vector, payloadPointer);
		if (this.hnsw.entryNodeID < 0) return this.insertFirst(node);
		let entry = this.hnsw.registry.getNode(this.hnsw.entryNodeID);
		if (!entry) {
			throw new Error('B"H HNSW entry node could not be loaded');
		}
		this.hnsw.maxLevel = Math.max(
			this.hnsw.maxLevel,
			Number(entry.level || 0)
		);
		for (
			let level = this.hnsw.maxLevel;
			level > node.level;
			level--
		) {
			entry = this.hnsw.ops.searchLayer(
				entry,
				node.vector,
				1,
				level
			)[0]?.node || entry;
		}
		this.hnsw.registry.saveNode(node);
		for (
			let level = Math.min(node.level, this.hnsw.maxLevel);
			level >= 0;
			level--
		) {
			entry = this.connectLevel(node, entry, level);
		}
		this.hnsw.backbone.connect(node);
		if (node.level > this.hnsw.maxLevel) {
			this.hnsw.updateEntryPoint(node);
		}
		this.hnsw.keys.set(node.key, node.id);
		return node.id;
	}

	insertFirst(node) {
		this.hnsw.registry.saveNode(node);
		this.hnsw.updateEntryPoint(node);
		this.hnsw.keys.set(node.key, node.id);
		return node.id;
	}

	connectLevel(node, entry, level) {
		const candidates = this.hnsw.ops.searchLayer(
			entry,
			node.vector,
			this.hnsw.efConstruction,
			level
		);
		const limit = level === 0 ? this.hnsw.M0 : this.hnsw.M;
		const neighbors = candidates
			.slice(0, limit)
			.map(candidate => candidate.node.id);
		node.neighbors[level] = neighbors;
		this.hnsw.registry.saveNode(node);
		let reciprocal = false;
		for (const neighborId of neighbors) {
			const neighbor = this.hnsw.registry.getNode(neighborId);
			if (!neighbor) continue;
			reciprocal = this.hnsw.ops.connectNeighbor(
				neighbor,
				node.id,
				level
			) || reciprocal;
		}
		if (!reciprocal && neighbors.length > 0) {
			this.hnsw.ops.forceNeighbor(
				this.hnsw.registry.getNode(neighbors[0]),
				node.id,
				level
			);
		}
		return candidates[0]?.node || entry;
	}

	createNode(key, vector, payloadPointer) {
		const textKey = String(key);
		const level = deterministicLevel(textKey, this.hnsw.ml);
		const canonicalVector = vector instanceof Float32Array
			? vector
			: Float32Array.from(vector || []);
		return {
			id: this.hnsw.registry.count(),
			key: textKey,
			level,
			vector: canonicalVector,
			payloadPtr: payloadPointer,
			neighbors: Array.from({ length: level + 1 }, () => []),
			deleted: false
		};
	}
}

module.exports = HNSWInserter;
