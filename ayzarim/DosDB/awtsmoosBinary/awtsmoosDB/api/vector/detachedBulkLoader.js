// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/detachedBulkLoader.js
 * @chapter Metadata Enters In Chunks And One Graph Enters In One Generation
 * @description Persists metadata-only rows, then builds one binary Float32 HNSW
 * graph whose registry pointers and complete key ledger each persist once.
 */

const constants = require('../../constants.js');
const createSourceIterator = require('./reindex/sourceIterator.js');
const { pathOf } = require('./pathResolver.js');
const entryTools = require('./detachedEntry.js');
const bulkSession = require('./graphBulkSession.js');
const tools = require('./detachedBulkTools.js');

class DetachedBulkLoader {
	constructor(manager) {
		this.manager = manager;
	}

	load(handle, sourceEntries, options = {}) {
		const path = String(pathOf(handle));
		if (this.manager.metadata.read(path)) throw tools.alreadyIndexed(path);
		const entries = entryTools.normalizeEntries(sourceEntries);
		if (!entries.length) return tools.empty(path);
		const dimensions = Number(options.dimensions || entries[0].vector.length);
		entryTools.validateDimensions(entries, dimensions);
		this.writePayloads(handle, entries, options);
		const index = this.manager.db.batch(() => {
			this.manager.metadata.create(path, {
				dimensions,
				metric: options.metric || 'cosine'
			});
			const graph = this.manager.getIndex(path);
			this.buildGraphWithinBatch(handle, entries, graph, path);
			return graph;
		});
		return tools.report(path, entries.length, dimensions, options, index);
	}

	writePayloads(handle, entries, options) {
		if (Number(handle.length || 0) > 0) {
			if (options.replace !== true) throw tools.nonEmpty();
			handle.splice(0, Number(handle.length));
		}
		const chunkSize = Math.max(1, Number(options.chunkSize || 250));
		for (let offset = 0; offset < entries.length; offset += chunkSize) {
			const chunk = entries.slice(offset, offset + chunkSize);
			handle.splice(
				Number(handle.length || 0),
				0,
				...chunk.map(entry => entry.payload)
			);
			this.manager.db.waitForIdle();
			options.onProgress?.({
				loaded: Math.min(offset + chunk.length, entries.length),
				total: entries.length
			});
		}
	}

	buildGraphWithinBatch(handle, entries, index, path) {
		const soul = handle[constants.SYMBOLS.INTERNALS] || handle;
		soul.ensureResolved(true);
		const iterator = createSourceIterator(this.manager.db, soul);
		if (!iterator) {
			throw new Error(`B"H compact vector source is not iterable: ${path}`);
		}
		bulkSession.begin(index, { detached: true });
		try {
			let position = 0;
			for (const row of iterator) {
				const entry = entries[position++];
				if (!entry) throw tools.count(path, position, entries.length);
				index.insert(entry.key, entry.vector, row.pointer || Buffer.alloc(16));
			}
			if (position !== entries.length) {
				throw tools.count(path, position, entries.length);
			}
			bulkSession.commit(index);
			this.manager.persistIndex(path, index);
		} catch (error) {
			bulkSession.abort(index);
			throw error;
		}
	}
}

module.exports = DetachedBulkLoader;
