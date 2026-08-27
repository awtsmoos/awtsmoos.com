// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/vector_detached_graph_clone_helpers.js
 * @chapter The Test Remembers Geometry Without Hiding It In The Main Trial
 * @description Captures stable graph topology, creates deterministic rows, and
 * compares indexed result IDs for the detached clone regression.
 */

function rows(count = 64) {
	return Array.from({ length: count }, (_, index) => ({
		id: `row-${index}`,
		text: `payload-${index}`,
		vec: [index === 0 ? 1 : 0.5, index / count, 0, 0]
	}));
}

function snapshot(database, list) {
	const status = database.vector.indexStatus(list);
	const nodes = status.index.keys.entries().map(([key, id]) => {
		const node = status.index.registry.getNode(Number(id));
		return {
			position: Number(key),
			id: node.id,
			level: node.level,
			vector: new Float32Array(node.vector),
			neighbors: node.neighbors.map(level => Array.from(level)),
			deleted: node.deleted
		};
	}).sort((left, right) => left.id - right.id);
	return {
		dimensions: 4,
		metric: 'cosine',
		entryNodeID: status.entryNodeID,
		maxLevel: status.maxLevel,
		nodes
	};
}

function topology(value) {
	return {
		entryNodeID: value.entryNodeID,
		maxLevel: value.maxLevel,
		nodes: value.nodes.map(node => ({
			id: node.id,
			level: node.level,
			vector: Array.from(node.vector),
			neighbors: node.neighbors
		}))
	};
}

function nearestIds(database, list, count = 5) {
	return database.vector.nearestIndexed(
		list,
		[1, 0, 0, 0],
		count
	).map(hit => hit.item.id);
}

module.exports = {
	nearestIds,
	rows,
	snapshot,
	topology
};
