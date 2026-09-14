// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shardReadiness.test.js
 * @description
 * Public inventory distinguishes physical vector storage from product semantic
 * eligibility. English corpora may advertise semantic vectors; Hebrew/non-English
 * generations never do, even while obsolete vector artifacts remain on disk.
 */

const assert = require('node:assert/strict');
const {
	publicShard,
	searchModes
} = require('../resultShape.js');

const storedOnly = publicShard({
	id: 'stored-only',
	title: 'Fixture English corpus',
	listName: 'vectors',
	count: 12,
	dimensions: 384,
	vectorEnabled: false
});
assert.equal(storedOnly.storedVectors, true);
assert.equal(storedOnly.indexed, false);
assert.equal(storedOnly.semanticEligible, true);
assert.deepEqual(storedOnly.modes, ['semantic-vector-exact']);

const indexed = publicShard({
	id: 'indexed',
	contentLanguage: 'en',
	listName: 'vectors',
	count: 12,
	dimensions: 384,
	vectorEnabled: true
});
assert.equal(indexed.storedVectors, true);
assert.equal(indexed.indexed, true);
assert.deepEqual(indexed.modes, [
	'semantic-vector-exact',
	'semantic-vector-indexed'
]);

const textAndIndex = searchModes({
	textFile: '/private/source.jsonl',
	storedVectors: true,
	indexed: true,
	semanticEligible: true
});
assert.deepEqual(textAndIndex, [
	'text',
	'semantic-vector-exact',
	'semantic-vector-indexed'
]);

const hebrew = publicShard({
	id: 'tanach-hebrew',
	contentLanguage: 'he',
	listName: 'vectors',
	count: 12,
	dimensions: 384,
	vectorEnabled: true
});
assert.equal(hebrew.storedVectors, true);
assert.equal(hebrew.semanticEligible, false);
assert.deepEqual(hebrew.modes, []);

const empty = publicShard({ id: 'empty' });
assert.equal(empty.storedVectors, false);
assert.equal(empty.indexed, false);
assert.deepEqual(empty.modes, []);

console.log('shardReadiness.test passed');
