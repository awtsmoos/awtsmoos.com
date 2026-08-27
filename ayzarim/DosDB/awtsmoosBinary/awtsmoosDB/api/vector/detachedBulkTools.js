// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/detachedBulkTools.js
 * @chapter Detached Bulk Loading Reports Its One Durable Graph Generation
 * @description Centralizes compact load errors and reports while the loader keeps
 * graph control flow small, readable, and beneath the module-size covenant.
 */

function report(path, loaded, dimensions, options, index) {
	return {
		path,
		loaded,
		dimensions,
		metric: options.metric || 'cosine',
		registryCount: index.registry.count(),
		vectorsDuplicatedInPayloads: false,
		graphDurabilityBoundaries: 1
	};
}

function alreadyIndexed(path) {
	const error = new Error(
		`B"H detached vector bulk load requires an unindexed handle: ${path}`
	);
	error.code = 'AWTSMOOS_DB_VECTOR_BULK_ALREADY_INDEXED';
	return error;
}

function nonEmpty() {
	const error = new Error(
		'B"H detached vector bulk load requires an empty handle or replace:true'
	);
	error.code = 'AWTSMOOS_DB_VECTOR_BULK_NON_EMPTY';
	return error;
}

function count(path, actual, expected) {
	return new Error(
		`B"H compact vector payload count mismatch at ${path}: ${actual}/${expected}`
	);
}

function empty(path) {
	return {
		path,
		loaded: 0,
		dimensions: 0,
		registryCount: 0,
		vectorsDuplicatedInPayloads: false,
		graphDurabilityBoundaries: 0
	};
}

module.exports = {
	alreadyIndexed,
	count,
	empty,
	nonEmpty,
	report
};
