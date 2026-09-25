//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file librarySearchConcurrencyPolicy.test.js
 * @description The Awtsmoos lets independent search vessels answer in one shared
 * breath; Awtsmoos.com preserves deliberate Hebrew lexical ordering without
 * forcing neutral or vector discovery to wait behind a baseline phase.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { searchPlanMode } = require('../librarySearchPlanner.js');

/** Neutral English discovery may safely run independent lanes concurrently. */
test('neutral text discovery uses concurrent scheduling', () => {
	assert.equal(searchPlanMode({ query: 'Torah', strategy: 'text' }), 'concurrent');
	assert.equal(searchPlanMode({ query: 'Moshiach' }), 'concurrent');
});

/** Hebrew lexical discovery retains its deliberate ordered enrichment plan. */
test('Hebrew text discovery preserves lexical sequencing', () => {
	assert.equal(searchPlanMode({ query: 'תורה', strategy: 'text' }), 'lexical');
	assert.equal(searchPlanMode({ query: 'שלום' }), 'lexical');
});

/** Explicit vector search stays concurrent regardless of query script. */
test('vector discovery remains concurrent for every language', () => {
	assert.equal(searchPlanMode({ query: 'תורה', strategy: 'vector' }), 'concurrent');
	assert.equal(searchPlanMode({ query: 'Torah', strategy: 'vector' }), 'concurrent');
});
