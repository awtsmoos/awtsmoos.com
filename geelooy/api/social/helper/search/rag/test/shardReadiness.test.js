// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shardReadiness.test.js
 * @description
 * Proves public inventory never confuses stored vectors with a usable persisted
 * graph, so supervisors and callers warm only strict indexed publication lanes.
 */

const assert = require('node:assert/strict');
const {
	publicShard,
	searchModes
} = require('../resultShape.js');

const storedOnly = publicShard({
	id: 'stored-only',
	listName: 'vectors',
	count: 12,
	dimensions: 384,
	vectorEnabled: false
});
assert.equal(storedOnly.storedVectors, true);
assert.equal(storedOnly.indexed, false);
assert.deepEqual(storedOnly.modes, ['vector-exact']);

const indexed = publicShard({
	id: 'indexed',
	listName: 'vectors',
	count: 12,
	dimensions: 384,
	vectorEnabled: true
});
assert.equal(indexed.storedVectors, true);
assert.equal(indexed.indexed, true);
assert.deepEqual(indexed.modes, [
	'vector-exact',
	'vector-indexed'
]);

const textAndIndex = searchModes({
	textFile: '/private/source.jsonl',
	storedVectors: true,
	indexed: true
});
assert.deepEqual(textAndIndex, [
	'text',
	'vector-exact',
	'vector-indexed'
]);

const empty = publicShard({ id: 'empty' });
assert.equal(empty.storedVectors, false);
assert.equal(empty.indexed, false);
assert.deepEqual(empty.modes, []);

console.log('shardReadiness.test passed');
