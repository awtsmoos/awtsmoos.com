// B"H

/**
 * @file api/vector/hnsw/ops.js
 * @chapter Search Traversal And Bounded Connection Share Living Neighbors
 * @description Executes layer search and delegates tombstone-aware protected
 * neighbor ranking to a focused module.
 */

const BinaryHeap = require('../../../utils/math/heap.js');
const HNSWNeighborRanker = require('./neighborRanker.js');

class HNSWOps {
	constructor(hnsw) {
		this.hnsw = hnsw;
		this.ranker = new HNSWNeighborRanker(hnsw);
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
			if (
				results.size() >= breadth
				&& worst
				&& current.dist > worst.dist
			) break;
			this.visitNeighbors(
				current,
				queryVector,
				breadth,
				level,
				visited,
				candidates,
				results
			);
		}
		return results.content.sort((left, right) => left.dist - right.dist);
	}

	visitNeighbors(current, queryVector, breadth, level, visited, candidates, results) {
		for (const neighborId of current.node.neighbors[level] || []) {
			if (visited.has(neighborId)) continue;
			visited.add(neighborId);
			const neighbor = this.hnsw.registry.getNode(neighborId);
			if (!neighbor || neighbor.deleted) continue;
			const distance = this.hnsw.metric(queryVector, neighbor.vector);
			const worst = results.content[0];
			if (
				results.size() >= breadth
				&& worst
				&& distance >= worst.dist
			) continue;
			const candidate = { dist: distance, node: neighbor };
			candidates.push(candidate);
			results.push(candidate);
			if (results.size() > breadth) results.pop();
		}
	}

	connectNeighbor(node, neighborId, level) {
		const limit = level === 0 ? this.hnsw.M0 : this.hnsw.M;
		const neighbors = node.neighbors[level] || [];
		if (!neighbors.includes(neighborId)) neighbors.push(neighborId);
		node.neighbors[level] = this.ranker.rank(node, neighbors, limit);
		this.hnsw.registry.saveNode(node);
		return node.neighbors[level].includes(neighborId);
	}

	forceNeighbor(node, neighborId, level) {
		if (!node) return false;
		const limit = level === 0 ? this.hnsw.M0 : this.hnsw.M;
		node.neighbors[level] = this.ranker.rank(
			node,
			[neighborId, ...(node.neighbors[level] || [])],
			limit
		);
		this.hnsw.registry.saveNode(node);
		return node.neighbors[level].includes(neighborId);
	}
}

module.exports = HNSWOps;
