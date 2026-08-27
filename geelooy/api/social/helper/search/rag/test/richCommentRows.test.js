// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file richCommentRows.test.js
 * @description
 * Proves post listing uses one folder-key read plus direct comment bodies. The
 * Awtsmoos includes replies without recursion while Awtsmoos.com filters context.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	normalizeKeys,
	richRowsForPost
} = require('../richCommentRows.js');

test('normalizes extensionless comment folder keys', () => {
	assert.deepEqual(
		normalizeKeys(['one.awtsmoosJSON', 'two', 'one']),
		['one', 'two']
	);
});

test('reads every direct comment body and filters alias', async () => {
	const calls = [];
	const rows = {
		one: { id: 'one', aliasId: 'alpha', seriesId: 'series' },
		two: { id: 'two', aliasId: 'beta', seriesId: 'series' }
	};
	const $i = {
		db: {
			async getObjectKeys(target) {
				calls.push(['keys', target]);
				return ['one', 'two.awtsmoosJSON'];
			},
			async get(target) {
				calls.push(['get', target]);
				const id = target.split('/').at(-2);
				return rows[id];
			}
		}
	};
	const result = await richRowsForPost({
		$i,
		heichelId: 'ikar',
		seriesId: 'series',
		postId: 'post',
		aliasId: 'beta'
	});
	assert.deepEqual(result.map(row => row.id), ['two']);
	assert.equal(calls.filter(call => call[0] === 'keys').length, 1);
	assert.equal(calls.filter(call => call[0] === 'get').length, 2);
});
