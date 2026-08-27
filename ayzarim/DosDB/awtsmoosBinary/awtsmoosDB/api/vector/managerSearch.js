// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/managerSearch.js
 * @chapter Strict Search Refuses A Hollow Graph While Friendly Search May Scan Rows
 * @description Keeps indexed and compatibility search behavior explicit outside
 * the public vector manager facade.
 */

const statusTools = require('./status.js');
const { scanNearest, vectorOf } = require('./query.js');

function nearest(manager, handle, queryVector, count = 5) {
	const query = vectorOf(queryVector);
	if (!query) return [];
	const graph = manager.getIndex(handle)?.search(query, count) || [];
	return graph.length ? graph : scanNearest(handle, query, count);
}

function nearestIndexed(manager, handle, queryVector, count = 5) {
	const query = vectorOf(queryVector);
	if (!query) throw statusTools.vectorError('query is not a finite vector');
	const status = manager.indexStatus(handle);
	if (!status.usable) {
		throw statusTools.vectorError(
			`index is not usable: ${status.path}`,
			statusTools.publicStatus(status)
		);
	}
	const results = status.index.search(query, count);
	if (!results.length) {
		throw statusTools.vectorError(
			`index returned no live payloads: ${status.path}`,
			statusTools.publicStatus(status)
		);
	}
	return results;
}

module.exports = {
	nearest,
	nearestIndexed
};
