// B"H

/**
 * @file core/vacuum/derivedIndexes.js
 * @chapter A Rebuilt Index Must Prove That It Contains Living Nodes
 * @description
 * Captures canonical index configuration, rebuilds destination-owned structures,
 * and verifies them after reopen so an empty or unreadable graph cannot pass.
 */

const { resolvePath } = require('../../api/vector/pathResolver.js');

const DERIVED_ROOT_KEYS = new Set(['__sys_vector__', '__sys_search__']);

function capture(db) {
	return {
		vectors: db.vector?.configurations?.() || [],
		search: searchPaths(db)
	};
}

function searchPaths(db) {
	const root = db.root.__sys_search__;
	if (!root) return [];
	return db.keys(root).map(String).sort();
}

function rebuild(db, configuration) {
	const rebuilt = { vectors: 0, search: 0, vectorReports: [], searchPaths: [] };
	for (const item of configuration.vectors) {
		const handle = requireHandle(db, item.path, 'vector');
		db.vector.enable(handle, { dimensions: item.dimensions, metric: item.metric });
		const report = db.vector.lastReindexReport(handle);
		const status = db.vector.indexStatus(handle);
		if (!report || !status.usable) throw rebuildError('vector graph is empty or unusable', item.path, { report, status: publicStatus(status) });
		rebuilt.vectors++;
		rebuilt.vectorReports.push({ ...report, status: publicStatus(status) });
	}
	for (const path of configuration.search) {
		db.search.enable(requireHandle(db, path, 'search'));
		rebuilt.search++;
		rebuilt.searchPaths.push(path);
	}
	db.waitForIdle();
	return rebuilt;
}

function verify(db, configuration) {
	const report = { ok: true, vectorAudits: [], searchPaths: [], errors: [] };
	for (const item of configuration.vectors) {
		const handle = resolvePath(db, item.path);
		if (!handle) { report.errors.push(`vector path missing: ${item.path}`); continue; }
		const audit = db.vector.auditIndex(handle);
		report.vectorAudits.push(audit);
		if (!audit.ok) report.errors.push(`vector audit failed: ${item.path}`);
	}
	const persistedSearch = new Set(searchPaths(db));
	for (const path of configuration.search) {
		report.searchPaths.push({ path, present: persistedSearch.has(path) });
		if (!persistedSearch.has(path)) report.errors.push(`search path missing: ${path}`);
	}
	report.ok = report.errors.length === 0;
	return report;
}

function requireHandle(db, path, kind) {
	const handle = resolvePath(db, path);
	if (handle) return handle;
	throw rebuildError(`${kind} source path missing`, path);
}

function publicStatus(status) {
	return { path: status.path, configured: status.configured, registryCount: status.registryCount, entryNodeID: status.entryNodeID, usable: status.usable };
}

function rebuildError(reason, path, details) {
	const error = new Error(`B"H derived index rebuild failed: ${reason}: ${path}`);
	error.code = 'AWTSMOOS_DB_VACUUM_INDEX_REBUILD_FAILED';
	error.details = details;
	return error;
}

module.exports = {
	DERIVED_ROOT_KEYS,
	capture,
	rebuild,
	verify
};
