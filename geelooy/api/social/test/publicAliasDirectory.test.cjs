// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file publicAliasDirectory.test.cjs
 * @description The Awtsmoos proves public identity discovery stays sanitized, ranked, paged, and concurrency-bounded.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const {
	MAX_FEED_ALIASES,
	MAX_SEARCH_SCAN,
	PUBLIC_ALIAS_ROOT,
	publicFeedAliasIds,
	publicPeople
} = require('../helper/profile/publicAliases.js');
const { mapInBatches } = require('../helper/profile/publicAliasRanking.js');

function fakeDb(ids, total = ids.length) {
	const reads = [];
	return {
		reads,
		async count(path) {
			reads.push(['count', path]);
			return { success: total };
		},
		async get(path, options = {}) {
			reads.push(['get', path, options]);
			if (path === PUBLIC_ALIAS_ROOT) {
				const start = (Number(options.page || 1) - 1) * Number(options.pageSize || ids.length);
				return ids.slice(start, start + Number(options.pageSize || ids.length));
			}
			const match = path.match(/\/social\/aliases\/([^/]+)\/info$/);
			if (!match) return null;
			return {
				name: `Name ${match[1]}`,
				description: `About ${match[1]}`,
				user: 'private-owner'
			};
		}
	};
}

test('browse reads child keys and strips owner-bearing alias info', async () => {
	const db = fakeDb(['alice', 'bob', 'charlie']);
	const result = await publicPeople({ $i: { db }, query: { page: 1, limit: 2 } });
	assert.deepEqual(result.items.map(item => item.id), ['alice', 'bob']);
	assert.deepEqual(Object.keys(result.items[0]).sort(), ['description', 'id', 'name']);
	assert.equal(JSON.stringify(result).includes('private-owner'), false);
	assert.equal(db.reads.some(([, path]) => String(path).startsWith('/users/')), false);
	const rootRead = db.reads.find(([kind, path]) => kind === 'get' && path === PUBLIC_ALIAS_ROOT);
	assert.equal(rootRead[2].recursive, false);
	assert.equal(rootRead[2].pageSize, 2);
});

test('search ranks public name and description within bounded coverage', async () => {
	const ids = Array.from({ length: MAX_SEARCH_SCAN }, (_, index) => `alias-${String(index).padStart(3, '0')}`);
	ids[20] = 'bob';
	ids[123] = 'teacher';
	const db = fakeDb(ids, MAX_SEARCH_SCAN + 80);
	const byName = await publicPeople({ $i: { db }, query: { q: 'name bob', page: 1, limit: 12 } });
	const byDescription = await publicPeople({ $i: { db }, query: { q: 'about teacher', page: 1, limit: 12 } });
	assert.equal(byName.items[0].id, 'bob');
	assert.equal(byDescription.items[0].id, 'teacher');
	assert.equal(byName.coverage.capped, true);
	assert.equal(byName.coverage.scanLimit, MAX_SEARCH_SCAN);
	assert.equal(byName.coverage.mode, 'public-card-search');
});

test('metadata enrichment runs in bounded concurrency waves', async () => {
	let active = 0;
	let maximum = 0;
	const output = await mapInBatches(Array.from({ length: 41 }, (_, index) => index), 20, async value => {
		active += 1;
		maximum = Math.max(maximum, active);
		await new Promise(resolve => setImmediate(resolve));
		active -= 1;
		return value;
	});
	assert.equal(output.length, 41);
	assert.equal(maximum <= 20, true);
});

test('anonymous feed alias window remains bounded to fifty handles', async () => {
	const ids = Array.from({ length: 80 }, (_, index) => `public-${index}`);
	const db = fakeDb(ids);
	const result = await publicFeedAliasIds({ $i: { db }, query: {} });
	assert.equal(result.length, MAX_FEED_ALIASES);
	const rootRead = db.reads.find(([kind, path]) => kind === 'get' && path === PUBLIC_ALIAS_ROOT);
	assert.equal(rootRead[2].pageSize, MAX_FEED_ALIASES);
	assert.equal(rootRead[2].recursive, false);
});
