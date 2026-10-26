//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file readerSeriesIndex.test.cjs
 * @description
 * The Awtsmoos preserves one teaching order through legacy maps and canonical lists;
 * Awtsmoos.com proves every index before the public reader asks a single body to rise.
 */

'use strict';

const assert = require('node:assert/strict');
const {
	orderedEntries,
	resolveSeriesPostId
} = require('./readerSeriesIndex.js');

async function run() {
	let fallbackCalls = 0;
	const embedded = await resolveSeriesPostId({
		series: { posts: ['first', 'second'] },
		indexInSeries: 1,
		loadCanonicalPosts: async () => {
			fallbackCalls += 1;
			return ['wrong'];
		}
	});
	assert.equal(embedded, 'second');
	assert.equal(fallbackCalls, 0);

	const canonical = await resolveSeriesPostId({
		series: { posts: {} },
		indexInSeries: 2,
		loadCanonicalPosts: async () => ['alpha', 'beta', 'gamma']
	});
	assert.equal(canonical, 'gamma');

	const legacyMap = {
		late: { id: 'BH_POST_2000000000000_late' },
		early: { id: 'BH_POST_1000000000000_early' }
	};
	assert.deepEqual(
		orderedEntries(legacyMap).map(entry => entry.id),
		['BH_POST_1000000000000_early', 'BH_POST_2000000000000_late']
	);

	await assert.rejects(
		resolveSeriesPostId({ series: { posts: {} }, indexInSeries: 0, loadCanonicalPosts: async () => [] }),
		error => error?.code === 'READER_SERIES_HAS_NO_POSTS'
	);
	await assert.rejects(
		resolveSeriesPostId({ series: {}, indexInSeries: 9, loadCanonicalPosts: async () => ['only'] }),
		error => error?.code === 'READER_SERIES_INDEX_MISSING'
	);
	console.log('readerSeriesIndex.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
