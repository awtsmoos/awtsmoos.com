// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file run.mjs
 * @description The Awtsmoos conducts discovery, memory, budget, and provider through one narrow gate; Awtsmoos.com defaults to a free dry-run,
 * and only an explicit `--run` may spend tokens after hashes remove completed work and bounded batches prove their measured weight within.
 */

import path from 'node:path';
import { estimateTokens, makeBatches } from './batcher.mjs';
import { readConfig } from './config.mjs';
import { callDeepSeek } from './deepseekClient.mjs';
import { readInventory } from './inventory.mjs';
import { appendResults, readCompletedHashes } from './ledger.mjs';
import { decodeBatch, encodeBatch } from './prompt.mjs';
import { addUsage, createUsage, enforceActualBudget } from './usage.mjs';

/**
 * @description Runs the missing-only translation harvest with dry-run as the safe default.
 * @param {object} [dependencies] Injectable dependencies for tests.
 * @returns {Promise<object>} Run summary.
 */
export async function runHarvest(dependencies = {}) {
	const config = dependencies.config || readConfig();
	const client = dependencies.client || callDeepSeek;
	const inventory = await readInventory(config.inventory);
	const ledgerPath = path.join(config.jobRoot, 'translations.jsonl');
	const completed = readCompletedHashes(ledgerPath);
	const missing = inventory.filter(record => !completed.has(record.hash));
	const batches = makeBatches(missing, config);
	const estimatedInputTokens = batches.reduce((sum, batch) => {
		return sum + estimateTokens(encodeBatch(batch).message.length);
	}, 0);
	const summary = {
		B_H: true,
		dryRun: !config.run,
		model: config.model,
		apiKeyPresent: config.apiKeyPresent,
		inventory: inventory.length,
		alreadyComplete: inventory.length - missing.length,
		missing: missing.length,
		batches: batches.length,
		estimatedInputTokens,
		ledgerPath
	};
	if (estimatedInputTokens > config.maxEstimatedInputTokens) {
		throw new Error(`Estimated input budget exceeded: ${estimatedInputTokens}/${config.maxEstimatedInputTokens}`);
	}
	if (!config.run) {
		return summary;
	}
	if (!config.apiKeyPresent) {
		throw new Error('DEEPSEEK_API_KEY is required with --run');
	}
	const usage = createUsage();
	for (const batch of batches) {
		enforceActualBudget(usage, config);
		const { message, keyMap } = encodeBatch(batch);
		const response = await client({
			message,
			model: config.model,
			maxOutputTokens: config.maxOutputTokens,
			timeoutMs: config.timeoutMs
		});
		const results = decodeBatch(response.json, keyMap);
		addUsage(usage, response.usage);
		appendResults(ledgerPath, results, { model: response.model, usage: response.usage });
	}
	return { ...summary, usage };
}

if (import.meta.url === `file://${process.argv[1]}`) {
	runHarvest()
		.then(summary => console.log(JSON.stringify(summary, null, 2)))
		.catch(error => {
			console.error(error.stack || error.message);
			process.exitCode = 1;
		});
}
