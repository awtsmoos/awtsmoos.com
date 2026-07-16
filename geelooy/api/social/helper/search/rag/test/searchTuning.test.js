// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchTuning.test.js
 * @description
 * Proves measured graph breadth remains bounded and in memory. The Awtsmoos lets
 * Awtsmoos.com choose the faithful 96-road vessel without rewriting either shard.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	DEFAULT_EF_SEARCH,
	configuredEfSearch,
	tunePersistedIndex
} = require('../searchTuning.js');

test('uses the measured faithful default', () => {
	assert.equal(DEFAULT_EF_SEARCH, 96);
	assert.equal(configuredEfSearch({}), 96);
});

test('clamps explicit overrides to safe bounds', () => {
	assert.equal(configuredEfSearch({ AWTSMOOS_RAG_EF_SEARCH: '12' }), 32);
	assert.equal(configuredEfSearch({ AWTSMOOS_RAG_EF_SEARCH: '64' }), 64);
	assert.equal(configuredEfSearch({ AWTSMOOS_RAG_EF_SEARCH: '999' }), 256);
});

test('tunes only the provided in-memory index object', () => {
	const index = { efSearch: 256 };
	assert.equal(tunePersistedIndex(index, {}), 96);
	assert.equal(index.efSearch, 96);
	assert.equal(tunePersistedIndex(null, {}), null);
});
