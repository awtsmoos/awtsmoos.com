// B"H — Discovery search pagination contract (Project Revelation).
// Unpaged callers keep the exact legacy behavior (full bounded list);
// explicit limit/offset/page callers receive one capped window.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { paginateResults, MAX_PAGE_LIMIT, DEFAULT_PAGE_LIMIT } = require('./discoverySearch.js');

const items = Array.from({ length: 250 }, (_, i) => i + 1);

test('no paging params returns the full list unchanged', () => {
	assert.equal(paginateResults(items, {}), items);
	assert.equal(paginateResults(items, { q: 'niggun' }).length, 250);
});

test('limit and offset slice one window', () => {
	assert.deepEqual(paginateResults(items, { limit: 10, offset: 20 }), items.slice(20, 30));
	assert.deepEqual(paginateResults(items, { limit: 5 }), items.slice(0, 5));
});

test('page derives offset from the effective limit', () => {
	assert.deepEqual(paginateResults(items, { page: 3, limit: 10 }), items.slice(20, 30));
	assert.deepEqual(paginateResults(items, { page: 1 }), items.slice(0, DEFAULT_PAGE_LIMIT));
});

test('limit is capped and invalid values fall back safely', () => {
	assert.equal(paginateResults(items, { limit: 99999 }).length, MAX_PAGE_LIMIT);
	assert.equal(paginateResults(items, { limit: 'abc' }).length, DEFAULT_PAGE_LIMIT);
	assert.equal(paginateResults(items, { limit: 10, offset: -4 }).length, 10);
	assert.deepEqual(paginateResults(null, { limit: 3 }), []);
});
