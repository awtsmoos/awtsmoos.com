// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/persistedTopology.js
 * @chapter Living Graph Geometry Is Separated From Historical Addresses
 * @description Captures a deletion-free HNSW topology by matching every node's
 * payload pointer to its source-row position, then remaps node IDs densely for a
 * compact destination without changing vectors, levels, or live neighbor edges.
 */

const constants = require('../../constants.js');
const createSourceIterator = require('./reindex/sourceIterator.js');

function snapshot(manager, handle) {
	const status = manager.indexStatus(handle);
	if (!status.usable) throw topologyError(`index is not usable: ${status.path}`);
	const positions = payloadPositions(manager.db, handle, status.path);
	const live = collectLive(status, positions);
	if (live.length !== positions.size) {
		throw topologyError(`row/vector count mismatch: ${live.length}/${positions.size}`);
	}
	const oldToNew = new Map(live.map((node, newId) => [node.oldId, newId]));
	const orderedKeys = Array.from({ length: positions.size });
	const nodes = live.map((node, newId) => {
		orderedKeys[node.position] = node.key;
		return {
			position: node.position,
			id: newId,
			level: node.level,
			vector: node.vector,
			neighbors: remapNeighbors(node.neighbors, oldToNew),
			deleted: false
		};
	});
	if (orderedKeys.some(key => key === undefined)) {
		throw topologyError('one or more source rows have no vector key');
	}
	return {
		dimensions: Number(status.index.meta.dimensions || status.index.meta.dim || 0),
		metric: status.index.meta.metric || 'cosine',
		entryNodeID: remapEntry(status.entryNodeID, live, oldToNew),
		maxLevel: Math.max(...nodes.map(node => node.level)),
		orderedKeys,
		nodes
	};
}

function payloadPositions(database, handle, path) {
	const soul = handle[constants.SYMBOLS.INTERNALS] || handle;
	soul.ensureResolved(true);
	const iterator = createSourceIterator(database, soul);
	if (!iterator) throw topologyError(`source is not iterable: ${path}`);
	const output = new Map();
	let position = 0;
	for (const row of iterator) {
		const token = pointerToken(row.pointer);
		if (output.has(token)) throw topologyError(`duplicate payload pointer: ${token}`);
		output.set(token, position++);
	}
	return output;
}

function collectLive(status, positions) {
	const output = [];
	for (const [key, id] of status.index.keys.entries()) {
		const node = status.index.registry.getNode(Number(id));
		if (!node || node.deleted) throw topologyError(`key points to missing/deleted node: ${key}`);
		const position = positions.get(pointerToken(node.payloadPtr));
		if (!Number.isInteger(position)) throw topologyError(`node payload is not a source row: ${key}`);
		output.push({
			key: String(key),
			oldId: Number(node.id),
			position,
			level: Number(node.level),
			vector: new Float32Array(node.vector),
			neighbors: node.neighbors.map(level => Array.from(level))
		});
	}
	return output.sort((left, right) => left.oldId - right.oldId);
}

function remapNeighbors(levels, oldToNew) {
	return levels.map(level => Array.from(new Set(
		Array.from(level || [])
			.filter(id => oldToNew.has(Number(id)))
			.map(id => oldToNew.get(Number(id)))
	)));
}

function remapEntry(entryId, live, oldToNew) {
	if (oldToNew.has(Number(entryId))) return oldToNew.get(Number(entryId));
	let selected = live[0];
	for (const node of live) if (node.level > selected.level) selected = node;
	return oldToNew.get(selected.oldId);
}

function pointerToken(pointer) {
	return Buffer.from(pointer || []).toString('hex');
}

function topologyError(message) {
	const error = new Error(`B"H persisted topology refused: ${message}`);
	error.code = 'AWTSMOOS_DB_VECTOR_TOPOLOGY_INVALID';
	return error;
}

module.exports = { snapshot };
