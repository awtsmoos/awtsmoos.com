// B"H

/**
 * @file api/vector/index.js
 * @chapter One Graph Mutation Produces One Reachable Registry
 * @description Coordinates vector metadata, queries, mutations, reconciliation, audits, and bulk loading.
 */

const HNSW = require('./hnsw.js');
const VectorReindexer = require('./reindexer.js');
const VectorMetadata = require('./metadata.js');
const VectorBulkLoader = require('./bulkLoader.js');
const mutation = require('./mutation.js');
const reconcileVectorIndex = require('./reconcile/indexReconciler.js');
const auditVectorIndex = require('./audit.js');
const statusTools = require('./status.js');
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
		this.metadata.create(path, options);
		this.db.sysCache?.vector?.add(path);
		this.indexes.delete(path);
		if (options.reindex !== false) this.reindex(path, { requireUsable: true });
		return this.metadata.read(path);
	}

	getIndex(value) {
		const path = String(pathOf(value));
		if (this.indexes.has(path)) return this.indexes.get(path);
		const metadata = this.metadata.read(path);
		if (!metadata) return null;
		const root = this.metadata.root(false);
		const registry = root?.[metadata.regPath];
		const keyMap = root?.[metadata.mapPath];
		if (!registry || !keyMap) return null;
		const index = new HNSW(this.db, registry, keyMap, metadata);
		index.onEntryPointChanged = (id, level) => {
			metadata.entryNodeID = id;
			metadata.maxLevel = level;
		};
		this.indexes.set(path, index);
		return index;
	}

	insert(path, key, vector, payload) {
		const index = this.getIndex(path);
		const normalized = vectorOf(vector);
		return index && normalized ? mutation.insert(this, path, index, key, normalized, payload) : null;
	}

	delete(path, key) {
		const index = this.getIndex(path);
		return index ? mutation.remove(this, index, key) : false;
	}

	nearest(handle, queryVector, count = 5) {
		const query = vectorOf(queryVector);
		if (!query) return [];
		const graph = this.getIndex(handle)?.search(query, count) || [];
		return graph.length ? graph : scanNearest(handle, query, count);
	}

	nearestIndexed(handle, queryVector, count = 5) {
		const query = vectorOf(queryVector);
		if (!query) throw statusTools.vectorError('query is not a finite vector');
		const status = this.indexStatus(handle);
		if (!status.usable) throw statusTools.vectorError(`index is not usable: ${status.path}`, statusTools.publicStatus(status));
		const results = status.index.search(query, count);
		if (!results.length) throw statusTools.vectorError(`index returned no live payloads: ${status.path}`, statusTools.publicStatus(status));
		return results;
	}

	reindex(value, options = {}) {
		const path = String(pathOf(value));
		const index = this.getIndex(path);
		const handle = resolvePath(this.db, path);
		const report = index && handle ? this.db.batch(() => {
			const result = this.reindexer.run(path, index, handle);
			this.persistIndex(path, index);
			return result;
		}) : emptyReport(path);
		this.reindexReports.set(path, report);
		if (options.requireUsable && report.scanned > 0 && !statusTools.usableReport(report)) {
			throw statusTools.vectorError(`reindex produced an unusable graph: ${path}`, report);
		}
		return report;
	}

	reconcile(value) {
		return reconcileVectorIndex(this, value);
	}

	persistIndex(path, index) {
		index.meta.entryNodeID = index.entryNodeID;
		index.meta.maxLevel = index.maxLevel;
		this.metadata.write(path, index.meta);
	}

	indexStatus(value) {
		const path = String(pathOf(value));
		const index = this.getIndex(path);
		const count = index ? index.registry.count() : 0;
		return { path, index, configured: Boolean(this.metadata.read(path)), registryCount: count, entryNodeID: index?.entryNodeID ?? -1, maxLevel: Number(index?.maxLevel || 0), usable: count > 0 && index?.entryNodeID >= 0 };
	}

	bulkLoad(handle, records, options = {}) { return this.bulkLoader.load(handle, records, options); }
	configurations() { return this.metadata.configurations(); }
	lastReindexReport(value) { return this.reindexReports.get(String(pathOf(value))) || null; }
	auditIndex(value) { return auditVectorIndex(this, value); }
}

function emptyReport(path) { return { path, scanned: 0, indexed: 0, registryCount: 0, entryNodeID: -1 }; }

module.exports = VectorManager;
