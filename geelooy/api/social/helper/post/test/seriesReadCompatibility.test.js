//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file seriesReadCompatibility.test.js
 * @description
 * The Awtsmoos lets Awtsmoos.com reconcile legacy and routed post vessels without guessing;
 * bounded reads keep order, while transfer-surviving routed identities return only when proven.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	readRecordsByIds,
	readUnmappedPosts
} = require('../seriesReadCompatibility.js');

/** Builds the minimum legacy and routed database surfaces used by compatibility reads. */
function database({ legacyIds = [], routedIds = legacyIds } = {}) {
	const calls = { keys: 0, gets: 0 };
	const db = {
		__awtsmoosDbFsRouter: {
			maybe: async method => method === 'getObjectKeys' ? routedIds : undefined
		},
		getObjectKeys: async () => {
			calls.keys++;
			return legacyIds;
		},
		get: async path => {
			calls.gets++;
			const postId = String(path).split('/').at(-1);
			return { id: postId, title: `Post ${postId}` };
		}
	};
	return { db, calls };
}

test('detailed unmapped series avoids bulk standardReader', async () => {
	const ids = ['a', 'b', 'c'];
	const { db, calls } = database({ legacyIds: ids });
	let standardCalls = 0;
	const records = await readUnmappedPosts({
		$i: { db }, heichelId: 'ikar', seriesId: 'bereishis', withDetails: true,
		standardReader: async () => {
			standardCalls++;
			throw new Error('bulk legacy reader must stay dark');
		}
	});
	assert.deepEqual(records.map(record => record.id), ids);
	assert.equal(standardCalls, 0);
	assert.equal(calls.keys, 1);
	assert.equal(calls.gets, ids.length);
});

test('bounded child reads preserve requested order', async () => {
	const ids = Array.from({ length: 9 }, (_, index) => `p${index}`);
	let active = 0;
	let peak = 0;
	const db = {
		get: async path => {
			const id = String(path).split('/').at(-1);
			active++;
			peak = Math.max(peak, active);
			await new Promise(resolve => setTimeout(resolve, (9 - Number(id.slice(1))) * 2));
			active--;
			return { id };
		}
	};
	const records = await readRecordsByIds({ $i: { db }, heichelId: 'ikar', seriesId: 'bereishis' }, ids);
	assert.deepEqual(records.map(record => record.id), ids);
	assert.ok(peak <= 6);
	assert.ok(peak > 1);
});

test('canonical per-post reader restores missing child details', async () => {
	const db = {
		__awtsmoosDbFsRouter: { maybe: async () => ['a'] },
		getObjectKeys: async () => ['a'],
		get: async () => null
	};
	let canonicalReads = 0;
	const records = await readUnmappedPosts({
		$i: { db }, heichelId: 'ikar', seriesId: 'bereishis', withDetails: true,
		postReader: async postId => {
			canonicalReads++;
			return { id: postId, title: 'Bereishis' };
		}
	});
	assert.deepEqual(records, [{ id: 'a', title: 'Bereishis' }]);
	assert.equal(canonicalReads, 1);
});

test('transfer-restored routed keys replace an empty legacy index', async () => {
	const routedIds = ['maamar1', 'maamar2'];
	const { db } = database({ legacyIds: [], routedIds });
	const ids = await readUnmappedPosts({
		$i: { db }, heichelId: 'ikar', seriesId: 'ayinBeisVolume1', withDetails: false
	});
	assert.deepEqual(ids, routedIds);
});

test('incomplete routed keys never replace legacy identities', async () => {
	const legacyIds = ['a', 'b'];
	const { db } = database({ legacyIds, routedIds: ['b', 'c'] });
	const ids = await readUnmappedPosts({
		$i: { db }, heichelId: 'ikar', seriesId: 'safe-series', withDetails: false
	});
	assert.deepEqual(ids, legacyIds);
});
