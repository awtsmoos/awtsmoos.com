// B"H

/**
 * @file api/vector/reindexer.js
 * @chapter The Graph Is Woven In Memory And Its Registry Is Sealed Once
 * @description
 * Rebuilds HNSW from source payload pointers. Function-shaped LiveHandles are
 * valid records, dimensions are enforced, and registry persistence commits only
 * after every indexed node has been created successfully.
 */

const constants = require('../../constants.js');
const createSourceIterator = require('./reindex/sourceIterator.js');
const resolveRecord = require('./reindex/recordResolver.js');
const extractVector = require('./reindex/vectorExtractor.js');

class VectorReindexer {
	constructor(db) {
		this.db = db;
	}

	run(path, index, handle) {
		const soul = handle[constants.SYMBOLS.INTERNALS] || handle;
		soul.ensureResolved(true);
		const report = initialReport(path);
		if (!soul.ptr) return report;
		const iterator = createSourceIterator(this.db, soul);
		if (!iterator) return report;
		const expectedDimensions = Number(index.meta?.dim || 0);
		index.registry.beginBulk();

		try {
			for (const row of iterator) this.indexRow(index, row, expectedDimensions, report);
			index.registry.commitBulk();
		} catch (error) {
			index.registry.abortBulk();
			throw error;
		}

		report.registryCount = index.registry.count();
		report.entryNodeID = index.entryNodeID;
		return report;
	}

	indexRow(index, row, expectedDimensions, report) {
		report.scanned++;
		const record = resolveRecord(this.db, row.pointer, row.value);
		const vector = extractVector(record);
		if (!vector) {
			report.skipped++;
			return;
		}
		if (expectedDimensions && vector.length !== expectedDimensions) {
			report.invalidDimensions++;
			return;
		}
		index.insert(String(row.key), vector, row.pointer || Buffer.alloc(16));
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

module.exports = VectorReindexer;
