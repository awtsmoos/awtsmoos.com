// B"H
/**
 * @file api/vector/index.js
 * @chapter One Vector Body Serves Search, Audit, Mutation, Migration, And Vacuum
 * @description Coordinates graph lifecycle, detached loading/cloning/rebinding,
 * persisted-vector enumeration, topology capture, reconciliation, and audits.
 */
const HNSW = require('./hnsw.js');
const VectorReindexer = require('./reindexer.js');
const VectorMetadata = require('./metadata.js');
const VectorBulkLoader = require('./bulkLoader.js');
const DetachedBulkLoader = require('./detachedBulkLoader.js');
const DetachedRebinder = require('./detachedRebinder.js');
const DetachedGraphCloner = require('./detachedGraphCloner.js');
const managerMutation = require('./managerMutation.js');
const managerSearch = require('./managerSearch.js');
const persisted = require('./persistedEntries.js');
const topology = require('./persistedTopology.js');
const reconcileVectorIndex = require('./reconcile/indexReconciler.js');
const auditVectorIndex = require('./audit.js');
const statusTools = require('./status.js');
const { pathOf, resolvePath } = require('./pathResolver.js');

class VectorManager {
	constructor(database) {
		this.db = database;
		this.indexes = new Map();
		this.reindexReports = new Map();
		this.reindexer = new VectorReindexer(database);
		this.metadata = new VectorMetadata(database);
		this.bulkLoader = new VectorBulkLoader(this);
		this.detachedBulkLoader = new DetachedBulkLoader(this);
		this.detachedRebinder = new DetachedRebinder(this);
		this.detachedGraphCloner = new DetachedGraphCloner(this);
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

	insert(path, key, vector, payload) { return managerMutation.insert(this, path, key, vector, payload); }
	delete(path, key) { return managerMutation.remove(this, path, key); }
	replace(path, key, vector, payload) { return managerMutation.replace(this, path, key, vector, payload); }
	nearest(handle, vector, count = 5) { return managerSearch.nearest(this, handle, vector, count); }
	nearestIndexed(handle, vector, count = 5) { return managerSearch.nearestIndexed(this, handle, vector, count); }
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

	reconcile(value) { return reconcileVectorIndex(this, value); }
	persistIndex(path, index) {
		index.meta.entryNodeID = index.entryNodeID;
		index.meta.maxLevel = index.maxLevel;
		this.metadata.write(path, index.meta);
	}
	indexStatus(value) {
		const path = String(pathOf(value));
		const index = this.getIndex(path);
		const count = index ? index.registry.count() : 0;
		return {
			path, index,
			configured: Boolean(this.metadata.read(path)),
			registryCount: count,
			entryNodeID: index?.entryNodeID ?? -1,
			maxLevel: Number(index?.maxLevel || 0),
			usable: count > 0 && index?.entryNodeID >= 0
		};
	}
	bulkLoad(handle, records, options = {}) { return this.bulkLoader.load(handle, records, options); }
	bulkLoadDetached(handle, entries, options = {}) { return this.detachedBulkLoader.load(handle, entries, options); }
	rebindDetached(handle, entries, options = {}) { return this.detachedRebinder.rebind(handle, entries, options); }
	cloneDetachedGraph(handle, snapshot, keys, options = {}) { return this.detachedGraphCloner.clone(handle, snapshot, keys, options); }
	snapshotTopology(value) { return topology.snapshot(this, value); }
	entries(value, options = {}) { return persisted.entries(this, value, options); }
	nearestExact(value, vector, count = 5) { return persisted.nearestExact(this, value, vector, count); }
	configurations() { return this.metadata.configurations(); }
	lastReindexReport(value) { return this.reindexReports.get(String(pathOf(value))) || null; }
	auditIndex(value) { return auditVectorIndex(this, value); }
}

function emptyReport(path) {
	return { path, scanned: 0, indexed: 0, registryCount: 0, entryNodeID: -1 };
}

module.exports = VectorManager;
