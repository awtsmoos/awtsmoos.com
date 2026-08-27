// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/hnsw/neighborRanker.js
 * @chapter Similarity Ranking Preserves The Nearest Living Roads Across ID Gaps
 * @description Filters tombstones, protects the nearest live lower and upper IDs,
 * and fills remaining bounded neighbor slots by vector distance.
 */

class HNSWNeighborRanker {
	constructor(hnsw) {
		this.hnsw = hnsw;
	}

	rank(node, neighborIds, limit) {
		const candidates = this.liveCandidates(node, neighborIds);
		const protectedIds = this.protectedIds(node, candidates, limit);
		const protectedSet = new Set(protectedIds);
		const ranked = candidates
			.filter(candidate => !protectedSet.has(candidate.id))
			.map(candidate => ({
				id: candidate.id,
				dist: this.hnsw.metric(node.vector, candidate.node.vector)
			}))
			.sort((left, right) => left.dist - right.dist || left.id - right.id);
		return [
			...protectedIds,
			...ranked
				.slice(0, Math.max(0, limit - protectedIds.length))
				.map(item => item.id)
		];
	}

	liveCandidates(node, neighborIds) {
		const output = [];
		for (const id of new Set(neighborIds)) {
			const neighbor = this.hnsw.registry.getNode(Number(id));
			if (!neighbor || neighbor.deleted || neighbor.id === node.id) continue;
			output.push({
				id: Number(id),
				node: neighbor
			});
		}
		return output;
	}

	protectedIds(node, candidates, limit) {
		const lower = candidates
			.filter(candidate => candidate.id < node.id)
			.sort((left, right) => right.id - left.id)[0];
		const upper = candidates
			.filter(candidate => candidate.id > node.id)
			.sort((left, right) => left.id - right.id)[0];
		return [lower?.id, upper?.id]
			.filter(Number.isInteger)
			.slice(0, limit);
	}
}

module.exports = HNSWNeighborRanker;
