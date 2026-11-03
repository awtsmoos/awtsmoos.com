//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file indexedSourceCache.test.js
 * @description
 * The Awtsmoos tests that immutable source sparks may recur without a second costly graph walk;
 * Awtsmoos.com never caches mutable comments or outdated publication generations, nor lets concurrent requests stall.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { clearIndexedSourceCache, searchCachedSource } = require('../indexedSourceCache.js');

function fixture() {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-index-cache-'));
	const file = path.join(folder, 'part.awtsdb');
	fs.writeFileSync(file, 'generation-one');
	const options = {
		shard: { id: 'source', file, listName: 'texts', embeddingModel: 'bge-en' },
		query: 'Avraham',
		limit: 20,
		embedder: { provider: 'bge-en' }
	};
	return { file, folder, options };
}

function persistedResult(value) {
	return {
		index: { persisted: true },
		hits: [{ row: { id: value } }]
	};
}

test('identical indexed query is reused while live enrichment stays separate', async () => {
	clearIndexedSourceCache();
	const { folder, options } = fixture();
	let executions = 0;
	const calculate = async () => persistedResult(++executions);
	try {
		const first = await searchCachedSource(options, calculate);
		first.hits[0].row.id = 'modified-by-caller';
		const second = await searchCachedSource(options, calculate);
		assert.equal(executions, 1);
		assert.equal(first.sourceCacheHit, false);
		assert.equal(second.sourceCacheHit, true);
		assert.equal(second.hits[0].row.id, 1);
	} finally {
		fs.rmSync(folder, { recursive: true, force: true });
	}
});

test('physical publication change invalidates every stored source answer', async () => {
	clearIndexedSourceCache();
	const { file, folder, options } = fixture();
	let executions = 0;
	try {
		await searchCachedSource(options, async () => persistedResult(++executions));
		fs.writeFileSync(file, 'generation-two-with-new-size');
		const result = await searchCachedSource(options, async () => persistedResult(++executions));
		assert.equal(result.sourceCacheHit, false);
		assert.equal(result.hits[0].row.id, 2);
	} finally {
		fs.rmSync(folder, { recursive: true, force: true });
	}
});

test('unindexed fallback is never cached or mistaken for persisted HNSW', async () => {
	clearIndexedSourceCache();
	const { folder, options } = fixture();
	let calls = 0;
	try {
		for (let index = 0; index < 2; index += 1) {
			const value = await searchCachedSource(options, async () => {
				calls += 1;
				return { index: { persisted: false }, hits: [] };
			});
			assert.equal(value.sourceCacheHit, false);
		}
		assert.equal(calls, 2);
	} finally {
		fs.rmSync(folder, { recursive: true, force: true });
	}
});

test('concurrent identical searches share exactly one graph execution', async () => {
	clearIndexedSourceCache();
	const { folder, options } = fixture();
	let calls = 0;
	try {
		const calculation = async () => {
			calls += 1;
			await new Promise(resolve => setTimeout(resolve, 15));
			return persistedResult('same');
		};
		const [first, second] = await Promise.all([
			searchCachedSource(options, calculation),
			searchCachedSource(options, calculation)
		]);
		assert.equal(calls, 1);
		assert.equal(first.hits[0].row.id, second.hits[0].row.id);
		assert.equal(second.singleFlight, true);
	} finally {
		fs.rmSync(folder, { recursive: true, force: true });
	}
});
