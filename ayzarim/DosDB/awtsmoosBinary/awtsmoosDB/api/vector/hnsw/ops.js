// B"H

/**
 * @file api/vector/hnsw/ops.js
 * @chapter Candidate Breadth And Neighbor Trimming Obey One Graph Covenant
 * @description Executes layer search and bounded reciprocal neighbor connection.
 */

const BinaryHeap = require('../../../utils/math/heap.js');

class HNSWOps {
	constructor(hnsw) {
		this.hnsw = hnsw;
	}

	searchLayer(entryPoint, queryVector, breadth, level) {
		const visited = new Set();
		const candidates = new BinaryHeap(item => item.dist);
		const results = new BinaryHeap(item => -item.dist);
		const distance = this.hnsw.metric(queryVector, entryPoint.vector);
		const initial = { dist: distance, node: entryPoint };
		visited.add(entryPoint.id);
		candidates.push(initial);
		results.push(initial);

		while (candidates.size() > 0) {
			const current = candidates.pop();
			const worst = results.content[0];
			if (results.size() >= breadth && worst && current.dist > worst.dist) break;
			this.visitNeighbors(current, queryVector, breadth, level, visited, candidates, results);
		}
		return results.content.sort((left, right) => left.dist - right.dist);
	}

	visitNeighbors(current, queryVector, breadth, level, visited, candidates, results) {
		for (const neighborId of current.node.neighbors[level] || []) {
			if (visited.has(neighborId)) continue;
			visited.add(neighborId);
			const neighbor = this.hnsw.registry.getNode(neighborId);
			if (!neighbor) continue;
			const distance = this.hnsw.metric(queryVector, neighbor.vector);
			const worst = results.content[0];
			if (results.size() >= breadth && worst && distance >= worst.dist) continue;
			const candidate = { dist: distance, node: neighbor };
			candidates.push(candidate);
			results.push(candidate);
			if (results.size() > breadth) results.pop();
		}
	}

	connectNeighbor(node, neighborId, level) {
		const limit = level === 0 ? this.hnsw.M0 : this.hnsw.M;
		const neighbors = node.neighbors[level] || [];
		if (neighbors.includes(neighborId)) return;
		neighbors.push(neighborId);
		const ranked = [];
		for (const id of neighbors) {
			const neighbor = this.hnsw.registry.getNode(id);
			if (!neighbor) continue;
			ranked.push({
				id,
				dist: this.hnsw.metric(node.vector, neighbor.vector)
			});
		}
		ranked.sort((left, right) => left.dist - right.dist);
		node.neighbors[level] = ranked.slice(0, limit).map(item => item.id);
		this.hnsw.registry.saveNode(node);
	}
}

module.exports = HNSWOps;
