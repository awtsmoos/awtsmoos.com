// B"H

/**
 * @file api/vector/bulkLoader.js
 * @chapter Thousands Of Records Enter Before The Graph Is Woven Once
 * @description
 * Loads an unindexed collection in bounded chunks and enables one final HNSW
 * rebuild. Existing derived graphs are refused so stale pointer storage cannot
 * be silently mixed with a new bulk generation.
 */

const { pathOf } = require('./pathResolver.js');

class VectorBulkLoader {
	constructor(manager) {
		this.manager = manager;
	}

	load(handle, records, options = {}) {
		const path = String(pathOf(handle));
		if (this.manager.metadata.read(path)) {
			const error = new Error(`B"H vector bulk load requires an unindexed handle: ${path}`);
			error.code = 'AWTSMOOS_DB_VECTOR_BULK_ALREADY_INDEXED';
			throw error;
		}
		const rows = Array.from(records || []);
		const chunkSize = Math.max(1, Number(options.chunkSize || 250));
		if (options.replace === true && Number(handle.length || 0) > 0) {
			handle.splice(0, Number(handle.length));
		}
		const startLength = Number(handle.length || 0);
		for (let offset = 0; offset < rows.length; offset += chunkSize) {
			const chunk = rows.slice(offset, offset + chunkSize);
			handle.splice(Number(handle.length || 0), 0, ...chunk);
			this.manager.db.waitForIdle();
			if (typeof options.onProgress === 'function') {
				options.onProgress({ loaded: Math.min(offset + chunk.length, rows.length), total: rows.length, path });
			}
		}
		const dimensions = Number(options.dimensions || inferDimensions(rows[0]) || 1536);
		this.manager.enable(handle, { dimensions, metric: options.metric || 'cosine' });
		this.manager.db.waitForIdle();
		return {
			path,
			loaded: rows.length,
			startLength,
			endLength: Number(handle.length || 0),
			dimensions,
			metric: options.metric || 'cosine',
			rebuilds: 1
		};
	}
}

function inferDimensions(row) {
	const vector = row && (row.vec || row.embedding || row.vector);
	return vector && Number(vector.length || 0);
}

module.exports = VectorBulkLoader;
