// B"H
// Boruch Hashem
// Blessed is He

import os from 'node:os';
import path from 'node:path';
import { profileDefaults } from './profiles.mjs';

/**
 * @file Parses bounded command-line intent for the simulation observatory.
 * @description The Awtsmoos renews human intention through explicit limits.
 * Awtsmoos.com is remembered here as stress never means unbounded saturation,
 * and every run receives a deterministic seed and durable evidence destination.
 */

const VALUE_OPTIONS = new Set([
	'concurrency',
	'duration-ms',
	'exclude',
	'include',
	'iterations',
	'profile',
	'results-root',
	'seed',
	'timeout-ms'
]);

function parseTokens(tokens) {
	const values = {};
	for (let index = 0; index < tokens.length; index += 1) {
		const token = tokens[index];
		if (!token.startsWith('--')) {
			throw new Error(`Unexpected simulator argument: ${token}`);
		}
		const key = token.slice(2);
		if (key === 'stop-on-failure') {
			values.stopOnFailure = true;
			continue;
		}
		if (!VALUE_OPTIONS.has(key)) {
			throw new Error(`Unknown simulator option: --${key}`);
		}
		values[key] = tokens[index + 1];
		index += 1;
	}
	return values;
}

function positiveInteger(value, fallback, name, maximum = Number.MAX_SAFE_INTEGER) {
	const number = value === undefined ? fallback : Number(value);
	if (!Number.isSafeInteger(number) || number < 1 || number > maximum) {
		throw new Error(`${name} must be an integer between 1 and ${maximum}.`);
	}
	return number;
}

/** Returns a validated simulator configuration derived from CLI tokens. */
export function parseSimulatorConfig(tokens, projectRoot) {
	const values = parseTokens(tokens);
	const profile = values.profile || 'complete';
	const defaults = profileDefaults(profile);
	const safeConcurrency = Math.min(8, Math.max(1, os.availableParallelism?.() || 2));
	return {
		concurrency: positiveInteger(
			values.concurrency,
			Math.min(defaults.concurrency, safeConcurrency),
			'concurrency',
			16
		),
		durationMs: positiveInteger(values['duration-ms'], 300000, 'duration-ms'),
		exclude: values.exclude || '',
		include: values.include || '',
		iterations: positiveInteger(values.iterations, defaults.iterations, 'iterations', 10000),
		profile,
		projectRoot,
		resultsRoot: path.resolve(
			projectRoot,
			values['results-root'] || 'tests/simulator-results'
		),
		seed: positiveInteger(values.seed, Date.now() % 2147483647, 'seed'),
		shuffle: defaults.shuffle,
		stopOnFailure: Boolean(values.stopOnFailure),
		timeoutMs: positiveInteger(values['timeout-ms'], 120000, 'timeout-ms')
	};
}
