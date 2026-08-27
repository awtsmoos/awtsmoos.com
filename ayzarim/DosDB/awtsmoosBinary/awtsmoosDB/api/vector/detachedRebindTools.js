// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/detachedRebindTools.js
 * @chapter Vacuum Rebinding Validates Every Float32 Flame Before One Generation
 * @description Normalizes source vectors, validates dimensions, and reports the
 * single durable graph boundary used by detached vacuum reconstruction.
 */

const { vectorOf } = require('./query.js');

function normalize(entry, index) {
	const vector = vectorOf(entry?.vector);
	if (!vector) {
		throw new Error(`B"H detached source vector ${index} is invalid`);
	}
	return {
		key: String(entry.key ?? index),
		vector
	};
}

function validate(entries, dimensions) {
	for (let index = 0; index < entries.length; index++) {
		if (entries[index].vector.length !== dimensions) {
			throw new Error(
				`B"H detached source vector ${index} has ${entries[index].vector.length} dimensions, expected ${dimensions}`
			);
		}
	}
}

function report(path, count, index) {
	return {
		path,
		scanned: count,
		indexed: count,
		registryCount: index.registry.count(),
		entryNodeID: index.entryNodeID,
		detached: true,
		graphDurabilityBoundaries: 1
	};
}

function empty(path) {
	return {
		path,
		scanned: 0,
		indexed: 0,
		registryCount: 0,
		entryNodeID: -1,
		detached: true,
		graphDurabilityBoundaries: 0
	};
}

function alreadyIndexed(path) {
	const error = new Error(
		`B"H detached vector rebind requires an unindexed handle: ${path}`
	);
	error.code = 'AWTSMOOS_DB_VECTOR_REBIND_ALREADY_INDEXED';
	return error;
}

module.exports = {
	alreadyIndexed,
	empty,
	normalize,
	report,
	validate
};
