// B"H

/**
 * @file api/vector/index.js
 * @chapter An Index Must Contain Nodes Before It May Claim To Answer
 * @description
 * Coordinates metadata, HNSW, exact fallback, bulk loading, strict indexed
 * search, and graph audits. Rebuilds run inside one durability/free-list batch.
 */

const HNSW = require('./hnsw.js');
const VectorReindexer = require('./reindexer.js');
const VectorMetadata = require('./metadata.js');
const VectorBulkLoader = require('./bulkLoader.js');
const auditVectorIndex = require('./audit.js');
const { pathOf, resolvePath } = require('./pathResolver.js');
const { scanNearest, vectorOf } = require('./query.js');

class VectorManager {
	constructor(db) {
		this.db = db;
		this.indexes = new Map();
		this.reindexReports = new Map();
		this.reindexer = new VectorReindexer(db);
		this.metadata = new VectorMetadata(db);
		this.bulkLoader = new VectorBulkLoader(this);
	}

	enable(handle, options = {}) {
		const path = String(pathOf(handle));
		const metadata = this.metadata.create(path, options);
		if (this.db.sysCache) this.db.sysCache.vector.add(path);
		this.indexes.delete(path);
		if (options.reindex !== false) this.reindex(path, { requireUsable: true });
		return metadata;
	}

	getIndex(handleOrPath) {
		const path = String(pathOf(handleOrPath));
		if (this.indexes.has(path)) return this.indexes.get(path);
		const metadata = this.metadata.read(path);
		if (!metadata) return null;
		const root = this.metadata.root(false);
		const registry = root && root[metadata.regPath];
		const keyMap = root && root[metadata.mapPath];
		if (!registry || !keyMap) return null;
		const index = new HNSW(this.db, registry, keyMap, metadata);
		index.onEntryPointChanged = id => {
			metadata.entryNodeID = id;
			try { root.set(path, metadata); } catch (_error) {}
		};
		this.indexes.set(path, index);
		return index;
	}

	insert(path, key, vector, payload) {
		const index = this.getIndex(path);
		if (index) index.insert(key, vectorOf(vector), payload);
	}

	delete(path, key) {
		const index = this.getIndex(path);
		if (index) index.delete(key);
	}

	nearest(handle, queryVector, count = 5) {
		const query = vectorOf(queryVector);
		if (!query) return [];
		const index = this.getIndex(handle);
		const graph = index ? index.search(query, count) : [];
		return graph.length ? graph : scanNearest(handle, query, count);
	}

	nearestIndexed(handle, queryVector, count = 5) {
		const query = vectorOf(queryVector);
		if (!query) throw vectorError('query is not a finite vector');
		const status = this.indexStatus(handle);
		if (!status.usable) throw vectorError(`index is not usable: ${status.path}`, publicStatus(status));
		const results = status.index.search(query, count);
		if (!results.length) throw vectorError(`index returned no live payloads: ${status.path}`, publicStatus(status));
		return results;
	}

	reindex(handleOrPath, options = {}) {
		const path = String(pathOf(handleOrPath));
		const index = this.getIndex(path);
		const handle = resolvePath(this.db, path);
		const report = index && handle
			? this.db.batch(() => this.reindexer.run(path, index, handle))
			: { path, scanned: 0, indexed: 0, registryCount: 0, entryNodeID: -1 };
		this.reindexReports.set(path, report);
		if (options.requireUsable && report.scanned > 0 && !usableReport(report)) {
			throw vectorError(`reindex produced an unusable graph: ${path}`, report);
		}
		return report;
	}

	indexStatus(handleOrPath) {
		const path = String(pathOf(handleOrPath));
		const index = this.getIndex(path);
		const registryCount = index ? index.registry.count() : 0;
		const entryNodeID = index ? index.entryNodeID : -1;
		return { path, index, configured: Boolean(this.metadata.read(path)), registryCount, entryNodeID, usable: registryCount > 0 && entryNodeID >= 0 };
	}

	bulkLoad(handle, records, options = {}) { return this.bulkLoader.load(handle, records, options); }
	configurations() { return this.metadata.configurations(); }
	lastReindexReport(handleOrPath) { return this.reindexReports.get(String(pathOf(handleOrPath))) || null; }
	auditIndex(handleOrPath) { return auditVectorIndex(this, handleOrPath); }
}

function usableReport(report) { return report.indexed > 0 && report.registryCount >= report.indexed && report.entryNodeID >= 0; }
function publicStatus(status) { return { path: status.path, configured: status.configured, registryCount: status.registryCount, entryNodeID: status.entryNodeID, usable: status.usable }; }
function vectorError(message, details) { const error = new Error(`B"H vector index error: ${message}`); error.code = 'AWTSMOOS_DB_VECTOR_INDEX_INVALID'; error.details = details; return error; }

module.exports = VectorManager;
