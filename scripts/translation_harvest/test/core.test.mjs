// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core.test.mjs
 * @description The Awtsmoos proves that thrift begins before the network; Awtsmoos.com deduplicates source sparks, bounds each vessel,
 * maps terse provider IDs back to truth, and remembers completed hashes so a paid translation is never summoned twice beneath the sky.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { makeBatches } from '../batcher.mjs';
import { readInventory } from '../inventory.mjs';
import { appendResults, readCompletedHashes } from '../ledger.mjs';
import { decodeBatch, encodeBatch } from '../prompt.mjs';
import { addUsage, createUsage } from '../usage.mjs';

/**
 * @description Creates one disposable harvest directory that may vanish after the test.
 * @returns {string} Temporary directory path.
 */
function temporaryRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-translation-harvest-'));
}

test('inventory deduplicates source and skips existing translation', async () => {
	const root = temporaryRoot();
	const file = path.join(root, 'missing.jsonl');
	fs.writeFileSync(file, [
		JSON.stringify({ id: 'a', corpus: 'test', source: 'שלום' }),
		JSON.stringify({ id: 'b', corpus: 'test', source: 'שלום' }),
		JSON.stringify({ id: 'c', corpus: 'test', source: 'עולם', english: 'world' })
	].join('\n'));
	const records = await readInventory(file);
	assert.equal(records.length, 1);
	assert.equal(records[0].id, 'a');
});

test('batch and prompt preserve identity with compact keys', () => {
	const records = [
		{ id: 'alpha', hash: 'h1', corpus: 'x', metadata: {}, source: 'abc' },
		{ id: 'beta', hash: 'h2', corpus: 'x', metadata: {}, source: 'def' }
	];
	const batches = makeBatches(records, { maxBatchChars: 6, maxItemsPerBatch: 2 });
	assert.equal(batches.length, 1);
	const { message, keyMap } = encodeBatch(batches[0]);
	assert.equal(message, '{"x":[["0","abc"],["1","def"]]}');
	const decoded = decodeBatch({ x: [['0', 'A'], ['1', 'B']] }, keyMap);
	assert.deepEqual(decoded.map(row => [row.id, row.translation]), [['alpha', 'A'], ['beta', 'B']]);
});

test('append-only ledger and usage accounting preserve resume state', () => {
	const root = temporaryRoot();
	const ledger = path.join(root, 'translations.jsonl');
	appendResults(ledger, [{
		id: 'a', hash: 'hash-a', corpus: 'x', metadata: {}, translation: 'translated'
	}], { model: 'deepseek-v4-flash', usage: { total_tokens: 9 } });
	assert.deepEqual([...readCompletedHashes(ledger)], ['hash-a']);
	const usage = createUsage();
	addUsage(usage, {
		prompt_tokens: 8, completion_tokens: 3, total_tokens: 11,
		prompt_cache_hit_tokens: 6, prompt_cache_miss_tokens: 2
	});
	assert.deepEqual(usage, {
		requests: 1, promptTokens: 8, completionTokens: 3, totalTokens: 11,
		cacheHitTokens: 6, cacheMissTokens: 2
	});
});
