// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file clientRunner.test.mjs
 * @description The Awtsmoos keeps paid speech behind an explicit gate; Awtsmoos.com proves dry-run silence and inspects a mocked DeepSeek vessel,
 * ensuring the secret remains only in memory while non-thinking JSON mode carries the least costly faithful translation light.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { callDeepSeek } from '../deepseekClient.mjs';
import { runHarvest } from '../run.mjs';

/**
 * @description Produces a minimal fully bounded runner configuration.
 * @param {string} inventory Inventory path.
 * @param {string} jobRoot Temporary output path.
 * @param {boolean} run Whether paid mode is requested.
 * @param {boolean} apiKeyPresent Whether configuration sees an environment key.
 * @returns {object} Test configuration.
 */
function config(inventory, jobRoot, run, apiKeyPresent) {
	return {
		run, model: 'deepseek-v4-flash', inventory, jobRoot, apiKeyPresent,
		maxBatchChars: 60000, maxItemsPerBatch: 80, maxOutputTokens: 8192,
		maxRequests: 10, maxEstimatedInputTokens: 100000, maxTotalTokens: 100000,
		timeoutMs: 5000
	};
}

/**
 * @description Creates one missing-record fixture and returns its paths.
 * @returns {{inventory:string,jobRoot:string}} Disposable fixture paths.
 */
function fixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-harvest-runner-'));
	const inventory = path.join(root, 'missing.jsonl');
	fs.writeFileSync(inventory, `${JSON.stringify({ id: 'one', corpus: 'test', source: 'שלום' })}\n`);
	return { inventory, jobRoot: path.join(root, 'job') };
}

test('dry-run performs zero provider calls', async () => {
	const paths = fixture();
	let calls = 0;
	const summary = await runHarvest({
		config: config(paths.inventory, paths.jobRoot, false, false),
		client: async () => { calls += 1; throw new Error('must not run'); }
	});
	assert.equal(calls, 0);
	assert.equal(summary.dryRun, true);
	assert.equal(summary.missing, 1);
});

test('paid mode refuses absent environment key before provider call', async () => {
	const paths = fixture();
	let calls = 0;
	await assert.rejects(() => runHarvest({
		config: config(paths.inventory, paths.jobRoot, true, false),
		client: async () => { calls += 1; }
	}), /DEEPSEEK_API_KEY/);
	assert.equal(calls, 0);
});

test('mock client sends env key, JSON mode, and disables thinking', async () => {
	const previous = process.env.DEEPSEEK_API_KEY;
	process.env.DEEPSEEK_API_KEY = 'test-secret';
	let captured;
	try {
		const result = await callDeepSeek({
			message: '{"x":[["0","שלום"]]}', model: 'deepseek-v4-flash',
			maxOutputTokens: 100, timeoutMs: 5000,
			fetchImpl: async (url, options) => {
				captured = { url, options, body: JSON.parse(options.body) };
				return { ok: true, text: async () => JSON.stringify({
					model: 'deepseek-v4-flash', choices: [{ message: { content: '{"x":[["0","peace"]]}' } }],
					usage: { total_tokens: 7 }
				}) };
			}
		});
		assert.equal(captured.url, 'https://api.deepseek.com/chat/completions');
		assert.equal(captured.options.headers.Authorization, 'Bearer test-secret');
		assert.deepEqual(captured.body.thinking, { type: 'disabled' });
		assert.deepEqual(captured.body.response_format, { type: 'json_object' });
		assert.equal(result.json.x[0][1], 'peace');
	} finally {
		if (previous === undefined) delete process.env.DEEPSEEK_API_KEY;
		else process.env.DEEPSEEK_API_KEY = previous;
	}
});
