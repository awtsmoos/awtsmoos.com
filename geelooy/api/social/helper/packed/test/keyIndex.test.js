//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file keyIndex.test.js
 * @description
 * The Awtsmoos proves the key-offset index answers exactly: latest-wins,
 * tombstones, suffix reads, and misses — without ever scanning the shard.
 * Real temp shard files; no mocks.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
	writePacked,
	findKeyReverseAsync,
	findKeySuffixReverseAsync,
	listKeysReverseAsync
} = require('../socialPacked.js');
const { clearCache, SIDECAR_SUFFIX } = require('../keyIndex.js');

function tempRoot() {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-keyidx-'));
	return dir;
}
function rimraf(dir) {
	fs.rmSync(dir, { recursive: true, force: true });
}
function vessel(dir) {
	return { db: { directory: dir } };
}
function shardFile(dir) {
	return path.join(dir, 'socialPacked', 'social.core.awtsdb');
}

test('exact hit returns the latest record (latest-wins)', async () => {
	const dir = tempRoot();
	try {
		const $i = vessel(dir);
		writePacked({ $i, shard: 'core', key: '/posts/h1/p1', value: { n: 1 } });
		writePacked({ $i, shard: 'core', key: '/posts/h1/p1', value: { n: 2 } });
		const rec = await findKeyReverseAsync({ $i, shard: 'core', key: '/posts/h1/p1' });
		assert.ok(rec);
		assert.equal(rec.value.n, 2);
	} finally { rimraf(dir); clearCache(); }
});

test('tombstoned key reads as not-found', async () => {
	const dir = tempRoot();
	try {
		const $i = vessel(dir);
		writePacked({ $i, shard: 'core', key: '/posts/h1/p9', value: { n: 1 } });
		writePacked({ $i, shard: 'core', key: '/posts/h1/p9', value: null, op: 'del' });
		const rec = await findKeyReverseAsync({ $i, shard: 'core', key: '/posts/h1/p9' });
		assert.equal(rec, null);
	} finally { rimraf(dir); clearCache(); }
});

test('missing key answers null fast (no full-shard scan)', async () => {
	const dir = tempRoot();
	try {
		const $i = vessel(dir);
		// ~2000 padded records so a full scan would be plainly visible.
		const pad = 'x'.repeat(2000);
		for (let i = 0; i < 2000; i++) {
			writePacked({ $i, shard: 'core', key: `/posts/h1/bulk${i}`, value: { i, pad } });
		}
		const size = fs.statSync(shardFile(dir)).size;
		assert.ok(size > 3 * 1024 * 1024, `expected multi-MB shard, got ${size}`);
		const started = Date.now();
		const rec = await findKeyReverseAsync({ $i, shard: 'core', key: '/posts/h1/does-not-exist' });
		const elapsed = Date.now() - started;
		assert.equal(rec, null);
		assert.ok(elapsed < 5000, `miss took ${elapsed}ms — the index was not consulted`);
		// And a real key still resolves after the miss.
		const hit = await findKeyReverseAsync({ $i, shard: 'core', key: '/posts/h1/bulk1999' });
		assert.ok(hit && hit.value.i === 1999);
	} finally { rimraf(dir); clearCache(); }
});

test('bare postId suffix read finds the logical key; tombstone falls through', async () => {
	const dir = tempRoot();
	try {
		const $i = vessel(dir);
		writePacked({ $i, shard: 'core', key: '/posts/h1/abc', value: { v: 'old' } });
		writePacked({ $i, shard: 'core', key: '/allPosts/h1/abc', value: { v: 'new' } });
		const rec = await findKeySuffixReverseAsync({ $i, shard: 'core', postId: 'abc' });
		assert.ok(rec);
		assert.equal(rec.key, '/allPosts/h1/abc');
		assert.equal(rec.value.v, 'new');
		// Tombstone the newest; the older same-suffix key still wins.
		writePacked({ $i, shard: 'core', key: '/allPosts/h1/abc', value: null, op: 'del' });
		const rec2 = await findKeySuffixReverseAsync({ $i, shard: 'core', postId: 'abc' });
		assert.ok(rec2);
		assert.equal(rec2.key, '/posts/h1/abc');
		const miss = await findKeySuffixReverseAsync({ $i, shard: 'core', postId: 'nope' });
		assert.equal(miss, null);
	} finally { rimraf(dir); clearCache(); }
});

test('bulk appends outside the single-write path are caught by tail catch-up', async () => {
	const dir = tempRoot();
	try {
		const $i = vessel(dir);
		writePacked({ $i, shard: 'core', key: '/posts/h1/one', value: { n: 1 } });
		// Force the sidecar to persist, then append raw lines directly.
		await findKeyReverseAsync({ $i, shard: 'core', key: '/posts/h1/one' });
		const file = shardFile(dir);
		const raw = JSON.stringify({ op: 'put', key: '/posts/h1/direct', value: { n: 9 } }) + '\n';
		fs.appendFileSync(file, raw);
		const rec = await findKeyReverseAsync({ $i, shard: 'core', key: '/posts/h1/direct' });
		assert.ok(rec && rec.value.n === 9, 'tail catch-up must index direct appends');
	} finally { rimraf(dir); clearCache(); }
});

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
