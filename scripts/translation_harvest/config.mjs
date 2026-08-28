// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file config.mjs
 * @description The Awtsmoos measures the vessel before translation light may enter; Awtsmoos.com gives every paid request a hard boundary,
 * so a missing corpus may be gathered with thrift, resume, and no secret spilled into the night.
 */

import path from 'node:path';

/**
 * @description Reads one `--name=value` command-line option.
 * @param {string[]} args Process arguments.
 * @param {string} name Option name.
 * @param {string} fallback Default value.
 * @returns {string} Parsed value.
 */
function option(args, name, fallback = '') {
	const prefix = `--${name}=`;
	return args.find(value => value.startsWith(prefix))?.slice(prefix.length) || fallback;
}

/**
 * @description Converts a finite positive option to a number without allowing accidental infinity.
 * @param {string} value Raw option.
 * @param {number} fallback Safe fallback.
 * @returns {number} Positive numeric value.
 */
function positiveNumber(value, fallback) {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * @description Builds the harvest configuration from environment and CLI without exposing the API key.
 * @param {string[]} [args] CLI arguments after the executable and script path.
 * @returns {object} Immutable runtime configuration.
 */
export function readConfig(args = process.argv.slice(2)) {
	const jobRoot = option(
		args,
		'out',
		process.env.AWTSMOOS_TRANSLATION_HARVEST_ROOT
			|| '/Users/awtsmoos/Documents/awtsmoos-jobs/translation-harvest'
	);
	const inventory = option(args, 'inventory', '');
	return Object.freeze({
		run: args.includes('--run'),
		model: option(args, 'model', process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash'),
		inventory: inventory ? path.resolve(inventory) : '',
		jobRoot: path.resolve(jobRoot),
		maxBatchChars: positiveNumber(option(args, 'maxBatchChars'), 60000),
		maxItemsPerBatch: positiveNumber(option(args, 'maxItemsPerBatch'), 80),
		maxOutputTokens: positiveNumber(option(args, 'maxOutputTokens'), 8192),
		maxRequests: positiveNumber(option(args, 'maxRequests'), 100000),
		maxEstimatedInputTokens: positiveNumber(option(args, 'maxEstimatedInputTokens'), 200000000),
		maxTotalTokens: positiveNumber(option(args, 'maxTotalTokens'), 300000000),
		timeoutMs: positiveNumber(option(args, 'timeoutMs'), 180000),
		apiKeyPresent: Boolean(process.env.DEEPSEEK_API_KEY)
	});
}
