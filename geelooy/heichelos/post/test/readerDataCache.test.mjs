//B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { createReaderDataCache } = require('../../routes/heichel/readerDataCache.js');

test('reader cache coalesces concurrent loads and reuses a fresh value', async () => {
	let clock = 1000;
	let calls = 0;
	const cache = createReaderDataCache({ ttlMs: 100, now: () => clock });
	const loader = async () => {
		calls += 1;
		await new Promise(resolve => setTimeout(resolve, 10));
		return { title: 'Torah' };
	};
	const [first, second] = await Promise.all([
		cache.read('post-a', loader),
		cache.read('post-a', loader)
	]);
	assert.deepEqual(first, { title: 'Torah' });
	assert.deepEqual(second, first);
	assert.equal(calls, 1);
	assert.deepEqual(await cache.read('post-a', loader), first);
	assert.equal(calls, 1);
	clock += 101;
	assert.deepEqual(await cache.read('post-a', loader), first);
	assert.equal(calls, 2);
});

test('reader cache drops failed loads instead of poisoning later reads', async () => {
	let calls = 0;
	const cache = createReaderDataCache();
	await assert.rejects(cache.read('post-b', async () => {
		calls += 1;
		throw new Error('temporary failure');
	}));
	const value = await cache.read('post-b', async () => {
		calls += 1;
		return 'recovered';
	});
	assert.equal(value, 'recovered');
	assert.equal(calls, 2);
});

test('reader cache prunes oldest entries above its bound', async () => {
	let calls = 0;
	const cache = createReaderDataCache({ maxEntries: 2 });
	const load = value => cache.read(value, async () => {
		calls += 1;
		return value;
	});
	await load('a');
	await load('b');
	await load('c');
	assert.equal(cache.size(), 2);
	await load('a');
	assert.equal(calls, 4);
});
