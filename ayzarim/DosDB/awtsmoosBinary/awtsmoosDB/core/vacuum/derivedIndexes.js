// B"H

/**
 * @file core/vacuum/derivedIndexes.js
 * @chapter A Rebuilt Index Must Prove That It Contains Living Destination Nodes
 * @description Captures canonical configuration, rebuilds ordinary or compact
 * vectors against destination pointers, and verifies all derived indexes.
 */

const { resolvePath } = require('../../api/vector/pathResolver.js');
const vectorRebuilder = require('./vectorRebuilder.js');

const DERIVED_ROOT_KEYS = new Set(['__sys_vector__', '__sys_search__']);

function capture(database) {
	return {
		vectors: database.vector?.configurations?.() || [],
		search: searchPaths(database)
	};
}

function searchPaths(database) {
	const root = database.root.__sys_search__;
	if (!root) return [];
	return database.keys(root).map(String).sort();
}

function rebuild(source, destination, configuration) {
	const rebuilt = {
		vectors: 0,
		search: 0,
		vectorReports: [],
		searchPaths: []
	};
	for (const item of configuration.vectors) {
		const report = vectorRebuilder.rebuild(source, destination, item);
		rebuilt.vectors++;
		rebuilt.vectorReports.push(report);
	}
	for (const path of configuration.search) {
		destination.search.enable(requireHandle(destination, path, 'search'));
		rebuilt.search++;
		rebuilt.searchPaths.push(path);
	}
	destination.waitForIdle();
	return rebuilt;
}

function verify(database, configuration) {
	const report = {
		ok: true,
		vectorAudits: [],
		searchPaths: [],
		errors: []
	};
	for (const item of configuration.vectors) {
		const handle = resolvePath(database, item.path);
		if (!handle) {
			report.errors.push(`vector path missing: ${item.path}`);
			continue;
		}
		const audit = database.vector.auditIndex(handle);
		report.vectorAudits.push(audit);
		if (!audit.ok) report.errors.push(`vector audit failed: ${item.path}`);
	}
	const persistedSearch = new Set(searchPaths(database));
	for (const path of configuration.search) {
		report.searchPaths.push({ path, present: persistedSearch.has(path) });
		if (!persistedSearch.has(path)) report.errors.push(`search path missing: ${path}`);
	}
	report.ok = report.errors.length === 0;
	return report;
}

function requireHandle(database, path, kind) {
	const handle = resolvePath(database, path);
	if (handle) return handle;
	const error = new Error(`B"H ${kind} source path missing: ${path}`);
	error.code = 'AWTSMOOS_DB_VACUUM_INDEX_REBUILD_FAILED';
	throw error;
}

module.exports = {
	DERIVED_ROOT_KEYS,
	capture,
	rebuild,
	verify
};
