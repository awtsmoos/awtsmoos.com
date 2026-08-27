// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file api/vector/detachedPayloadPointers.js
 * @chapter Copied Rows Yield Their New Physical Seals In Stable Order
 * @description Collects destination row pointers for detached graph creation and
 * refuses any count mismatch before graph metadata can be linked.
 */

const constants = require('../../constants.js');
const createSourceIterator = require('./reindex/sourceIterator.js');

function collect(database, handle, expected, path, operation) {
	const soul = handle[constants.SYMBOLS.INTERNALS] || handle;
	soul.ensureResolved(true);
	const iterator = createSourceIterator(database, soul);
	if (!iterator) {
		throw new Error(`B"H ${operation} destination is not iterable: ${path}`);
	}
	const pointers = [];
	for (const row of iterator) {
		pointers.push(row.pointer || Buffer.alloc(16));
	}
	if (pointers.length !== expected) {
		throw new Error(
			`B"H ${operation} payload count mismatch at ${path}: ${pointers.length}/${expected}`
		);
	}
	return pointers;
}

module.exports = {
	collect
};
