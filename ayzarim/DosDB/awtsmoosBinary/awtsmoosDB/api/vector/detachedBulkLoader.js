// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/detachedBulkLoader.js
 * @description
 * The Awtsmoos lets payload vessels enter before one graph generation joins them into searchable unity and light;
 * Awtsmoos.com grants detached builds measured construction breadth while ordinary online HNSW insertion keeps its original might.
 */

const constants = require('../../constants.js');
const createSourceIterator = require('./reindex/sourceIterator.js');
const { pathOf } = require('./pathResolver.js');
const entryTools = require('./detachedEntry.js');
const bulkSession = require('./graphBulkSession.js');
const constructionProfile = require('./detachedConstructionProfile.js');
const writeDetachedPayloads = require('./detachedPayloadWriter.js');
const tools = require('./detachedBulkTools.js');

class DetachedBulkLoader {
	constructor(manager) {
		this.manager = manager;
	}

	/**
	 * @description Persists detached payload rows and seals one HNSW generation with optional offline-only construction breadth.
	 * @param {Object} handle - AwtsmoosDB list receiving metadata payload rows.
	 * @param {Iterable} sourceEntries - Stable keys, vectors, and metadata payloads to index.
	 * @param {Object} options - Dimensions, metric, chunking, replacement, progress, and optional constructionBreadth.
	 * @returns {Object} Detached load durability report including the breadth actually used.
	 */
	load(handle, sourceEntries, options = {}) {
		const path = String(pathOf(handle));
		if (this.manager.metadata.read(path)) throw tools.alreadyIndexed(path);
		const entries = entryTools.normalizeEntries(sourceEntries);
		if (!entries.length) return tools.empty(path);
		const dimensions = Number(options.dimensions || entries[0].vector.length);
		entryTools.validateDimensions(entries, dimensions);
		writeDetachedPayloads(this.manager, handle, entries, options);
		let constructionBreadth = null;
		const index = this.manager.db.batch(() => {
			this.manager.metadata.create(path, {
				dimensions,
				metric: options.metric || 'cosine'
			});
			const graph = this.manager.getIndex(path);
			constructionBreadth = this.buildGraph(handle, entries, graph, path, options);
			return graph;
		});
		return {
			...tools.report(path, entries.length, dimensions, options, index),
			constructionBreadth
		};
	}

	/**
	 * @description Builds one detached graph generation and restores normal online construction settings afterward.
	 * @param {Object} handle - Source payload list.
	 * @param {Object[]} entries - Normalized vectors and keys.
	 * @param {Object} index - HNSW graph instance.
	 * @param {string} path - Canonical vector path.
	 * @param {Object} options - Detached construction options.
	 * @returns {number} Construction breadth actually used.
	 */
	buildGraph(handle, entries, index, path, options) {
		const soul = handle[constants.SYMBOLS.INTERNALS] || handle;
		soul.ensureResolved(true);
		const iterator = createSourceIterator(this.manager.db, soul);
		if (!iterator) throw new Error(`B"H compact vector source is not iterable: ${path}`);
		bulkSession.begin(index, { detached: true });
		try {
			const profile = constructionProfile.withDetachedConstructionProfile(
				index,
				options,
				() => this.insertRows(iterator, entries, index, path)
			);
			bulkSession.commit(index);
			this.manager.persistIndex(path, index);
			return profile.constructionBreadth;
		} catch (error) {
			bulkSession.abort(index);
			throw error;
		}
	}

	insertRows(iterator, entries, index, path) {
		let position = 0;
		for (const row of iterator) {
			const entry = entries[position++];
			if (!entry) throw tools.count(path, position, entries.length);
			index.insert(entry.key, entry.vector, row.pointer || Buffer.alloc(16));
		}
		if (position !== entries.length) throw tools.count(path, position, entries.length);
	}
}

module.exports = DetachedBulkLoader;
