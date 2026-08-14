// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file publicFeedFairness.test.cjs
 * @description The Awtsmoos proves anonymous discovery rotates deterministically while explicit pages remain reproducible.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const {
	HOUR_MS,
	fairFeedWindow,
	feedPageCount,
	rotatingFeedPage,
	utcHourBucket
} = require('../helper/profile/feedFairness.js');
const {
	MAX_FEED_ALIASES,
	PUBLIC_ALIAS_ROOT,
	publicFeedAliasIds
} = require('../helper/profile/publicAliases.js');

test('page math handles empty, small, and rotating multi-page universes', () => {
	assert.equal(feedPageCount(0, 50), 1);
	assert.equal(feedPageCount(40, 50), 1);
	assert.equal(feedPageCount(120, 50), 3);
	assert.equal(rotatingFeedPage({ totalAliases: 120, bucket: 0 }), 1);
	assert.equal(rotatingFeedPage({ totalAliases: 120, bucket: 1 }), 2);
	assert.equal(rotatingFeedPage({ totalAliases: 120, bucket: 2 }), 3);
	assert.equal(rotatingFeedPage({ totalAliases: 120, bucket: 3 }), 1);
	assert.equal(rotatingFeedPage({ totalAliases: 120, requestedPage: 7, bucket: 99 }), 7);
	assert.equal(utcHourBucket(HOUR_MS * 4), 4);
});

test('automatic partial last pages wrap to the head without duplicates', async () => {
	const pages = {
		1: Array.from({ length: 50 }, (_, index) => `a-${index}`),
		3: Array.from({ length: 20 }, (_, index) => `c-${index}`)
	};
	const items = await fairFeedWindow({
		totalAliases: 120,
		pageSize: 50,
		bucket: 2,
		loadPage: async (page, size) => (pages[page] || []).slice(0, size)
	});
	assert.equal(items.length, 50);
	assert.equal(items[0], 'c-0');
	assert.equal(items[19], 'c-19');
	assert.equal(items[20], 'a-0');
	assert.equal(new Set(items).size, 50);
});

function fakeDb(ids) {
	const reads = [];
	let countCalls = 0;
	return {
		reads,
		get countCalls() {
			return countCalls;
		},
		async count(path) {
			countCalls += 1;
			return { success: ids.length };
		},
		async get(path, options = {}) {
			reads.push([path, options]);
			const start = (Number(options.page || 1) - 1) * Number(options.pageSize || MAX_FEED_ALIASES);
			return ids.slice(start, start + Number(options.pageSize || MAX_FEED_ALIASES));
		}
	};
}

test('public feed rotates hourly and fills a partial tail page', async () => {
	const ids = Array.from({ length: 120 }, (_, index) => `alias-${String(index).padStart(3, '0')}`);
	const db = fakeDb(ids);
	const result = await publicFeedAliasIds({ $i: { db }, query: {}, now: HOUR_MS * 2 });
	assert.equal(result.length, MAX_FEED_ALIASES);
	assert.equal(result[0], 'alias-100');
	assert.equal(result[19], 'alias-119');
	assert.equal(result[20], 'alias-000');
	assert.equal(db.countCalls, 1);
	assert.equal(db.reads[0][0], PUBLIC_ALIAS_ROOT);
	assert.equal(db.reads[0][1].page, 3);
	assert.equal(db.reads[1][1].page, 1);
});

test('explicit aliasPage preserves one-page semantics and skips alias count', async () => {
	const ids = Array.from({ length: 120 }, (_, index) => `alias-${index}`);
	const db = fakeDb(ids);
	const result = await publicFeedAliasIds({ $i: { db }, query: { aliasPage: 2 }, now: 0 });
	assert.equal(result.length, 50);
	assert.equal(db.countCalls, 0);
	assert.equal(db.reads.length, 1);
	assert.equal(db.reads[0][1].page, 2);
});
