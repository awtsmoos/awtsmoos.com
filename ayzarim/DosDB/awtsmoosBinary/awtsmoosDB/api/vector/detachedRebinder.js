// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/detachedRebinder.js
 * @chapter Copied Payloads Receive One Graph And One Key Ledger Generation
 * @description Rebuilds a destination-owned HNSW graph from persisted source
 * vectors beneath one outer batch, persisting registry and keys exactly once.
 */

const { pathOf } = require('./pathResolver.js');
const payloadPointers = require('./detachedPayloadPointers.js');
const bulkSession = require('./graphBulkSession.js');
const tools = require('./detachedRebindTools.js');

class DetachedRebinder {
	constructor(manager) {
		this.manager = manager;
	}

	rebind(handle, sourceEntries, options = {}) {
		const path = String(pathOf(handle));
		if (this.manager.metadata.read(path)) throw tools.alreadyIndexed(path);
		const entries = Array.from(sourceEntries || []).map(tools.normalize);
		if (!entries.length) return tools.empty(path);
		const dimensions = Number(options.dimensions || entries[0].vector.length);
		tools.validate(entries, dimensions);
		const pointers = payloadPointers.collect(
			this.manager.db,
			handle,
			entries.length,
			path,
			'vector rebind'
		);
		return this.manager.db.batch(() => this.rebindWithinBatch(
			entries,
			pointers,
			options,
			dimensions,
			path
		));
	}

	rebindWithinBatch(entries, pointers, options, dimensions, path) {
		this.manager.metadata.create(path, {
			dimensions,
			metric: options.metric || 'cosine'
		});
		const index = this.manager.getIndex(path);
		bulkSession.begin(index, { detachedRebind: true });
		try {
			for (let position = 0; position < entries.length; position++) {
				const entry = entries[position];
				index.insert(entry.key, entry.vector, pointers[position]);
			}
			bulkSession.commit(index);
			this.manager.persistIndex(path, index);
			return tools.report(path, entries.length, index);
		} catch (error) {
			bulkSession.abort(index);
			throw error;
		}
	}
}

module.exports = DetachedRebinder;
