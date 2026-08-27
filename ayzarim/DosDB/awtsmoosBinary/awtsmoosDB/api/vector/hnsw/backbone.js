// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/hnsw/backbone.js
 * @chapter Living Nodes Bridge Historical Gaps Without Losing A Search Road
 * @description Connects each insertion to the nearest lower live node and bridges
 * the nearest live lower and upper nodes when a node is deleted.
 */

class HNSWBackbone {
	constructor(hnsw) {
		this.hnsw = hnsw;
	}

	connect(node) {
		if (!node || node.id <= 0) return;
		const predecessor = this.findLower(node.id);
		if (!predecessor) return;
		this.connectPair(predecessor, node);
	}

	bridge(node) {
		if (!node) return;
		const predecessor = this.findLower(node.id);
		const successor = this.findUpper(node.id);
		if (predecessor && successor) {
			this.connectPair(predecessor, successor);
		}
	}

	connectPair(lower, upper) {
		this.hnsw.ops.forceNeighbor(lower, upper.id, 0);
		this.hnsw.ops.forceNeighbor(upper, lower.id, 0);
	}

	findLower(id) {
		for (let candidateId = Number(id) - 1; candidateId >= 0; candidateId--) {
			const node = this.hnsw.registry.getNode(candidateId);
			if (node && !node.deleted) return node;
		}
		return null;
	}

	findUpper(id) {
		const count = this.hnsw.registry.count();
		for (
			let candidateId = Number(id) + 1;
			candidateId < count;
			candidateId++
		) {
			const node = this.hnsw.registry.getNode(candidateId);
			if (node && !node.deleted) return node;
		}
		return null;
	}
}

module.exports = HNSWBackbone;
