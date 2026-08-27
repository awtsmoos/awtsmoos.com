// B"H

/**
 * @file exactHebrewRecords.test.js
 * @description
 * Proves exact lookup reads only one word vessel and the limited reference
 * vessels requested, while the live manager contains no whole-corpus inflater.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
	ROOTS,
	normalizeWord,
	searchRecords,
	wordKey
} = require('./exactHebrewRecords.js');

function fakeDatabase() {
	const calls = [];
	const refOne = { corpus: 'talmudBavli', tractateId: 'berakhot', postId: 'p1', text: 'אָמַר' };
	const refTwo = { corpus: 'talmudBavli', tractateId: 'berakhot', postId: 'p2', text: 'אָמַר מָר' };
	const values = new Map([
		[`talmudBavliExactHebrewIndex:words/${wordKey('אמר')}`, {
			word: 'אמר',
			count: 2,
			occurrences: [['r1', 4, 12, 'אָמַר'], ['r2', 12, 1, 'אָמַר']]
		}],
		['talmudBavliExactHebrewIndex:refs/r1', refOne],
		['talmudBavliExactHebrewIndex:refs/r2', refTwo]
	]);
	return {
		calls,
		DosDB: {
			get(recordPath, options) {
				calls.push({ recordPath, rootKey: options.rootKey });
				return values.get(`${options.rootKey}:${recordPath}`);
			}
		}
	};
}

test('normalizes niqqud and exposes every canonical corpus root', () => {
	assert.equal(normalizeWord('אָמַר'), 'אמר');
	assert.deepEqual(Object.keys(ROOTS), ['tanach', 'mishnah', 'talmudBavli']);
});

test('reads one word record and only the requested reference window', () => {
	const database = fakeDatabase();
	const result = searchRecords(database, {
		word: 'אָמַר',
		corpus: 'talmudBavli',
		offset: 1,
		limit: 1
	});

	assert.equal(result.totalHits, 2);
	assert.equal(result.hits.length, 1);
	assert.equal(result.hits[0].ref.postId, 'p2');
	assert.deepEqual(database.calls, [
		{
			recordPath: `words/${wordKey('אמר')}`,
			rootKey: 'talmudBavliExactHebrewIndex'
		},
		{
			recordPath: 'refs/r2',
			rootKey: 'talmudBavliExactHebrewIndex'
		}
	]);
});

test('live manager contains no obsolete whole-corpus inflation path', () => {
	const manager = fs.readFileSync(path.join(__dirname, 'exactHebrewIndex.js'), 'utf8');
	assert.equal(manager.includes('indexBlob'), false);
	assert.equal(manager.includes('gunzipSync'), false);
	assert.equal(manager.includes('JSON.parse(zlib'), false);
});
