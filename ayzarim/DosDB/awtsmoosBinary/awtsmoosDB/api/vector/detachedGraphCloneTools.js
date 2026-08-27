// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/detachedGraphCloneTools.js
 * @chapter A Cloned Node Keeps Geometry While Receiving A New Payload Seal
 * @description Validates a one-to-one graph snapshot and creates compact clone
 * reports without mixing control flow into the durable batch implementation.
 */

function cloneNode(sourceNode, payloadPtr) {
	if (!payloadPtr) {
		throw new Error(
			`B"H destination payload missing at position ${sourceNode.position}`
		);
	}
	return {
		id: sourceNode.id,
		level: sourceNode.level,
		vector: new Float32Array(sourceNode.vector),
		payloadPtr,
		neighbors: sourceNode.neighbors.map(level => Array.from(level)),
		deleted: false,
		ptr: null
	};
}

function validateSnapshot(snapshot, orderedKeys) {
	if (!snapshot || !Array.isArray(snapshot.nodes) || !snapshot.nodes.length) {
		throw new Error('B"H detached graph snapshot is empty');
	}
	if (snapshot.nodes.length !== orderedKeys.length) {
		throw new Error(
			`B"H detached graph snapshot count mismatch: ${snapshot.nodes.length}/${orderedKeys.length}`
		);
	}
	const positions = new Set();
	for (const node of snapshot.nodes) {
		if (node.deleted) {
			throw new Error('B"H detached graph clone refuses deleted source nodes');
		}
		if (
			!Number.isInteger(node.position)
			|| node.position < 0
			|| node.position >= orderedKeys.length
		) {
			throw new Error(
				`B"H detached graph position is invalid: ${node.position}`
			);
		}
		positions.add(node.position);
	}
	if (positions.size !== orderedKeys.length) {
		throw new Error('B"H detached graph positions are not one-to-one');
	}
}

function report(path, snapshot, index) {
	return {
		path,
		loaded: snapshot.nodes.length,
		dimensions: snapshot.dimensions,
		metric: snapshot.metric,
		registryCount: index.registry.count(),
		entryNodeID: index.entryNodeID,
		maxLevel: index.maxLevel,
		graphTopologyCloned: true,
		vectorsDuplicatedInPayloads: false,
		durabilityBoundaries: 1
	};
}

function alreadyIndexed(path) {
	const error = new Error(
		`B"H detached graph clone requires an unindexed handle: ${path}`
	);
	error.code = 'AWTSMOOS_DB_VECTOR_GRAPH_CLONE_ALREADY_INDEXED';
	return error;
}

module.exports = {
	alreadyIndexed,
	cloneNode,
	report,
	validateSnapshot
};
