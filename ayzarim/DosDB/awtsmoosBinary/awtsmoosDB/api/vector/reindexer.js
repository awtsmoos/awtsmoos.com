// B"H

/**
 * @file api/vector/reindexer.js
 * @chapter A Fresh Graph Seals Nodes And Names Once
 * @description Rebuilds only an empty HNSW generation, validates every vector,
 * and commits registry pointers plus the complete key ledger once.
 */

const constants = require('../../constants.js');
const createSourceIterator = require('./reindex/sourceIterator.js');
const resolveRecord = require('./reindex/recordResolver.js');
const extractVector = require('./reindex/vectorExtractor.js');
const bulkSession = require('./graphBulkSession.js');

class VectorReindexer {
	constructor(db) {
		this.db = db;
	}

	run(path, index, handle) {
		const soul = handle[constants.SYMBOLS.INTERNALS] || handle;
		soul.ensureResolved(true);
		const report = initialReport(path);
		if (!soul.ptr) return report;
		if (index.registry.count() !== 0) {
			throw reindexError(`graph is not empty: ${path}`);
		}
		const iterator = createSourceIterator(this.db, soul);
		if (!iterator) return report;
		const dimensions = Number(index.meta?.dim || 0);
		bulkSession.begin(index, { detached: true });
		try {
			for (const row of iterator) {
				this.indexRow(index, row, dimensions, report);
			}
			bulkSession.commit(index);
		} catch (error) {
			bulkSession.abort(index);
			throw error;
		}
		report.registryCount = index.registry.count();
		report.entryNodeID = index.entryNodeID;
		return report;
	}

	indexRow(index, row, dimensions, report) {
		report.scanned++;
		const record = resolveRecord(this.db, row.pointer, row.value);
		const vector = extractVector(record);
		if (!vector) {
			report.skipped++;
			return;
		}
		if (dimensions && vector.length !== dimensions) {
			report.invalidDimensions++;
			return;
		}
		index.insert(
			String(row.key),
			vector,
			row.pointer || Buffer.alloc(16)
		);
		report.indexed++;
	}
}

function initialReport(path) {
	return {
		path,
		scanned: 0,
		indexed: 0,
		skipped: 0,
		invalidDimensions: 0,
		registryCount: 0,
		entryNodeID: -1
	};
}

function reindexError(message) {
	const error = new Error(`B"H vector reindex error: ${message}`);
	error.code = 'AWTSMOOS_DB_VECTOR_REINDEX_REQUIRES_EMPTY_GRAPH';
	return error;
}

module.exports = VectorReindexer;
