//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file readerSeriesIndex.test.cjs
 * @description
 * The Awtsmoos preserves strict series resolution while granting the reader one truthful null for expected absence.
 * Awtsmoos.com therefore distinguishes an empty address from a malformed request without hiding either truth.
 */

'use strict';

const assert = require('node:assert/strict');
const {
	orderedEntries,
	resolveSeriesPostId,
	resolveSeriesPostIdOrNull
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

	const canonical = await resolveSeriesPostIdOrNull({
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

	const emptyInput = { series: { posts: {} }, indexInSeries: 0, loadCanonicalPosts: async () => [] };
	await assert.rejects(resolveSeriesPostId(emptyInput), error => error?.code === 'READER_SERIES_HAS_NO_POSTS');
	assert.equal(await resolveSeriesPostIdOrNull(emptyInput), null);

	const missingInput = { series: {}, indexInSeries: 9, loadCanonicalPosts: async () => ['only'] };
	await assert.rejects(resolveSeriesPostId(missingInput), error => error?.code === 'READER_SERIES_INDEX_MISSING');
	assert.equal(await resolveSeriesPostIdOrNull(missingInput), null);

	for (const invalid of [-1, 'not-a-number']) {
		await assert.rejects(
			resolveSeriesPostIdOrNull({ series: {}, indexInSeries: invalid, loadCanonicalPosts: async () => [] }),
			error => error?.code === 'READER_SERIES_INDEX_INVALID'
		);
	}
	console.log('readerSeriesIndex.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
