//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file subSeriesSummaries.test.js
 * @description
 * The Awtsmoos lets Awtsmoos.com show each child by proven identity, count, and name;
 * transfer bytes may never masquerade as metadata nor stain a Torah branch with false claim.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	identities,
	summarize
} = require('../subSeriesSummaries.js');

const SERIES_ID = 'ayinBeisVolume1';

test('transfer Buffer metadata yields identity without leaked numeric bytes', () => {
	const summary = summarize({
		prateem: { type: 'Buffer', data: [32] },
		posts: ['p1', 'p2'],
		subSeries: ['child']
	}, SERIES_ID);
	assert.deepEqual(summary, {
		id: SERIES_ID,
		posts: ['p1', 'p2'],
		subSeries: ['child'],
		postsCount: 2,
		subSeriesCount: 1
	});
	assert.equal(Object.prototype.hasOwnProperty.call(summary, '0'), false);
});

test('healthy child metadata and deterministic counts remain intact', () => {
	const summary = summarize({
		prateem: { id: 'healthy', name: 'Healthy Series', description: 'Torah' },
		posts: { a: {}, b: {} },
		subSeries: { c: {} }
	}, 'healthy');
	assert.deepEqual(summary, {
		id: 'healthy',
		name: 'Healthy Series',
		description: 'Torah',
		posts: ['a', 'b'],
		subSeries: ['c'],
		postsCount: 2,
		subSeriesCount: 1
	});
});

test('identity extraction refuses Buffer and accepts arrays or object keys', () => {
	assert.deepEqual(identities(Buffer.from([32])), []);
	assert.deepEqual(identities(['a', 'b']), ['a', 'b']);
	assert.deepEqual(identities({ a: {}, b: {} }), ['a', 'b']);
});

test('unknown corruption stays a bounded details error', () => {
	const summary = summarize({ prateem: Buffer.from([1, 2]) }, 'unknown');
	assert.deepEqual(summary, { id: 'unknown', error: 'Details not found' });
});
