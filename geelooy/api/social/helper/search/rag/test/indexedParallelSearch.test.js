//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file IndexedParallelSearchTest
 * @description
 * The Awtsmoos lets many physical index parts answer in parallel, then gathers all in ranked light;
 * Awtsmoos.com verifies every source stays counted and ordered, with no lost result from flight.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { searchParallelParts } = require('../indexedParallelSearch.js');
const { mergeResults } = require('../multipartVectorSearch.js');

function result(part) {
	return {
		hits: [{ score: part.score, row: { id: part.id }, rank: 1 }],
		totalRows: part.rows,
		index: { persisted: true, registryCount: part.rows, sessionReused: true }
	};
}

test('parallel part search preserves exact persisted merge semantics', async () => {
	const parts = [
		{ id: 'one', score: 0.8, rows: 14 },
		{ id: 'two', score: 0.1, rows: 25 },
		{ id: 'three', score: 0.4, rows: 30 }
	];
	const expected = mergeResults(parts.map(result), 2);
	const merged = await searchParallelParts(parts, [0.5], 2, async part => result(part));
	assert.deepEqual(merged, expected);
	assert.deepEqual(merged.hits.map(hit => hit.row.id), ['two', 'three']);
	assert.equal(merged.totalRows, 69);
	assert.equal(merged.index.persisted, true);
});

test('independent part work runs concurrently without dropping slow partitions', async () => {
	const parts = [1, 2, 3, 4];
	let active = 0;
	let peak = 0;
	const merged = await searchParallelParts(parts, [1], 4, async part => {
		active += 1;
		peak = Math.max(peak, active);
		await new Promise(resolve => setTimeout(resolve, 10));
		active -= 1;
		return result({ id: String(part), score: part / 10, rows: 1 });
	});
	assert.equal(peak, 4);
	assert.equal(merged.totalRows, 4);
	assert.equal(merged.hits.length, 4);
});

test('a failed physical index never pretends to return a complete result', async () => {
	await assert.rejects(
		searchParallelParts([1, 2], [1], 5, async part => {
			if (part === 2) throw Object.assign(new Error('index missing'), { code: 'INDEXED_VECTOR_SEARCH_UNAVAILABLE' });
			return result({ id: 'one', score: 0.1, rows: 1 });
		}),
		(error) => error.code === 'INDEXED_VECTOR_SEARCH_UNAVAILABLE'
	);
});
