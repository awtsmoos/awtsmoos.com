//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file keyIndexPart2.test.js
 * @description Sidecar + prefix-listing cases moved verbatim from keyIndex.test.js.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const {
	writePacked,
	findKeyReverseAsync,
	findKeySuffixReverseAsync,
	listKeysReverseAsync
} = require('../socialPacked.js');
const { clearCache, SIDECAR_SUFFIX } = require('../keyIndex.js');
const { tempRoot, rimraf, vessel, shardFile } = require('./keyIndexTestHelpers.js');

test('sidecar persists and reloads after cache clear', async () => {
	const dir = tempRoot();
	try {
		const $i = vessel(dir);
		writePacked({ $i, shard: 'core', key: '/posts/h1/keep', value: { n: 7 } });
		await findKeyReverseAsync({ $i, shard: 'core', key: '/posts/h1/keep' });
		assert.ok(fs.existsSync(shardFile(dir) + SIDECAR_SUFFIX), 'sidecar should exist');
		clearCache();
		const rec = await findKeyReverseAsync({ $i, shard: 'core', key: '/posts/h1/keep' });
		assert.ok(rec && rec.value.n === 7, 'sidecar reload must answer');
	} finally { rimraf(dir); clearCache(); }
});

test('prefix listing is newest-first and honors tombstones', async () => {
	const dir = tempRoot();
	try {
		const $i = vessel(dir);
		writePacked({ $i, shard: 'core', key: '/posts/h1/a', value: { n: 1 } });
		writePacked({ $i, shard: 'core', key: '/posts/h1/b', value: { n: 2 } });
		writePacked({ $i, shard: 'core', key: '/other/h1/c', value: { n: 3 } });
		writePacked({ $i, shard: 'core', key: '/posts/h1/b', value: null, op: 'del' });
		const keys = await listKeysReverseAsync({ $i, shard: 'core', prefix: '/posts/', limit: 10 });
		assert.deepEqual(keys, ['/posts/h1/a']);
	} finally { rimraf(dir); clearCache(); }
});