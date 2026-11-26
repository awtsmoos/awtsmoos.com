//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file seriesReadColdFill.test.cjs
 * @description
 * Run 5 (2026-11-26): the cold details fill for a 2,073-post series took
 * 13.55s and starved neighboring requests. These tests guard the two
 * remedies: the bounded details memo in SeriesReadCache (repeat pages skip
 * per-record reads, writers' invalidateSeries drops them, hits return a
 * fresh parse) and the cooperative yield inside readRecordsByIds (the
 * event loop breathes during a long fill, order is preserved).
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const cache = require('../seriesReadCache.js');
const { readRecordsByIds, YIELD_EVERY } = require('../seriesRecordReader.js');

test('details memo round-trips, returns fresh objects, and dies on invalidateSeries', () => {
	cache.invalidateAll();
	const records = [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }];
	assert.equal(cache.setCachedSeriesDetails('ikar', 'encyclopedia', '2:x', records), true);
	const hit = cache.getCachedSeriesDetails('ikar', 'encyclopedia', '2:x');
	assert.deepEqual(hit, records);
	hit[0].title = 'MUTATED';
	assert.equal(cache.getCachedSeriesDetails('ikar', 'encyclopedia', '2:x')[0].title, 'A');
	assert.equal(cache.getCachedSeriesDetails('ikar', 'encyclopedia', '2:y'), null);
	assert.equal(cache.getCachedSeriesDetails('ikar', 'other', '2:x'), null);
	cache.invalidateSeries('ikar', 'encyclopedia');
	assert.equal(cache.getCachedSeriesDetails('ikar', 'encyclopedia', '2:x'), null);
});

test('details memo refuses oversize pages', () => {
	cache.invalidateAll();
	const big = [{ id: 'x', content: 'z'.repeat(cache.MAX_DETAILS_BYTES + 16) }];
	assert.equal(cache.setCachedSeriesDetails('h', 's', '1:big', big), false);
	assert.equal(cache.getCachedSeriesDetails('h', 's', '1:big'), null);
});

test('details TTL default is the raised 300s constant', () => {
	assert.equal(cache.DETAILS_TTL_MS, 300 * 1000);
});

test('identity TTL default is the raised 300s constant', () => {
	assert.equal(cache.IDS_TTL_MS, 300 * 1000);
	cache.invalidateAll();
	cache.setCachedSeriesIds('h', 's', ['a', 'b']);
	assert.deepEqual(cache.getCachedSeriesIds('h', 's'), ['a', 'b']);
	cache.invalidateSeries('h', 's');
	assert.equal(cache.getCachedSeriesIds('h', 's'), null);
});

test('readRecordsByIds preserves order and yields to the event loop', async () => {
	const total = YIELD_EVERY * 5 + 3;
	const ids = Array.from({ length: total }, (_, i) => `post-${i}`);
	let reads = 0;
	const context = {
		$i: {
			db: {
				async get(path) {
					reads += 1;
					const id = path.split('/').pop();
					return { id, title: `T ${id}` };
				}
			}
		},
		heichelId: 'ikar',
		seriesId: 'encyclopedia'
	};
	let probeFired = false;
	setImmediate(() => { probeFired = true; });
	const records = await readRecordsByIds(context, ids);
	assert.equal(probeFired, true, 'a queued setImmediate must run during a long fill');
	assert.equal(records.length, total);
	assert.deepEqual(records.map(r => r.id), ids);
	assert.equal(reads, total);
});
