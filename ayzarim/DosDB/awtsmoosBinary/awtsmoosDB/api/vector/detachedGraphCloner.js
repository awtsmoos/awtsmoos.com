// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/detachedGraphCloner.js
 * @chapter One Proven Topology Crosses In One Durable Generation
 * @description Copies a validated HNSW topology, node registry, complete key
 * ledger, and destination payload pointers beneath one outer database batch.
 */

const { pathOf } = require('./pathResolver.js');
const payloadPointers = require('./detachedPayloadPointers.js');
const bulkSession = require('./graphBulkSession.js');
const tools = require('./detachedGraphCloneTools.js');

class DetachedGraphCloner {
	constructor(manager) {
		this.manager = manager;
	}

	clone(handle, snapshot, orderedKeys, options = {}) {
		const path = String(pathOf(handle));
		if (this.manager.metadata.read(path)) throw tools.alreadyIndexed(path);
		tools.validateSnapshot(snapshot, orderedKeys);
		const pointers = payloadPointers.collect(
			this.manager.db,
			handle,
			orderedKeys.length,
			path,
			'graph clone'
		);
		return this.manager.db.batch(() => this.cloneWithinBatch(
			snapshot,
			orderedKeys,
			options,
			pointers,
			path
		));
	}

	cloneWithinBatch(snapshot, orderedKeys, options, pointers, path) {
		this.manager.metadata.create(path, {
			dimensions: Number(options.dimensions || snapshot.dimensions),
			metric: options.metric || snapshot.metric || 'cosine'
		});
		const index = this.manager.getIndex(path);
		bulkSession.begin(index, { detachedGraphClone: true });
		try {
			for (const sourceNode of snapshot.nodes) {
				const position = Number(sourceNode.position);
				const key = String(orderedKeys[position]);
				index.registry.saveNode(
					tools.cloneNode(sourceNode, pointers[position])
				);
				index.keys.set(key, sourceNode.id);
			}
			bulkSession.commit(index);
			index.entryNodeID = snapshot.entryNodeID;
			index.maxLevel = snapshot.maxLevel;
			this.manager.persistIndex(path, index);
			return tools.report(path, snapshot, index);
		} catch (error) {
			bulkSession.abort(index);
			throw error;
		}
	}
}

module.exports = DetachedGraphCloner;
