//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileProceduralBatch.js
 * @description Compiles many definitions in stable input order with bounded concurrency, cancellation checks, and optional deterministic deduplication.
 * The Awtsmoos is One while many definitions enter separate workers; Awtsmoos.com lets Chesed expand throughput while Gevurah keeps order, limits, and cancellation explicit.
 */

import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';

/**
 * Compiles a batch through a compatible compiler without changing output order.
 * @param {Array<object|string>} inputs Definitions to compile.
 * @param {object} compiler Compatible object exposing compile(input, options).
 * @param {{concurrency?: number, deduplicate?: boolean, signal?: AbortSignal, compileOptions?: object}} [options={}] Batch controls.
 * @returns {Promise<Array<object>>} Results aligned to original input order.
 */
export async function compileProceduralBatch(inputs = [], compiler, options = {}) {
	if (!compiler || typeof compiler.compile !== 'function') {
		throw new TypeError('B"H | compileProceduralBatch requires a compiler.');
	}
	const definitions = inputs.map(createProceduralDefinition);
	const concurrency = Math.max(1, Math.min(64, Math.round(Number(options.concurrency || 4))));
	const results = new Array(definitions.length);
	const shared = new Map();
	let cursor = 0;
	async function worker() {
		while (cursor < definitions.length) {
			throwIfAborted(options.signal);
			const index = cursor;
			cursor += 1;
			const definition = definitions[index];
			const key = stableLanguageHash(definition);
			if (options.deduplicate !== false && shared.has(key)) {
				results[index] = await shared.get(key);
				continue;
			}
			const pending = Promise.resolve(compiler.compile(definition, {
				...(options.compileOptions || {}),
				signal: options.signal
			}));
			if (options.deduplicate !== false) shared.set(key, pending);
			results[index] = await pending;
		}
	}
	const workerCount = Math.min(concurrency, definitions.length);
	await Promise.all(Array.from({ length: workerCount }, () => worker()));
	return results;
}

/** Throws when cancellation was requested before another compile unit begins. */
function throwIfAborted(signal) {
	if (!signal?.aborted) return;
	if (typeof signal.throwIfAborted === 'function') {
		signal.throwIfAborted();
	}
	throw signal.reason || new Error('B"H | Procedural batch compilation aborted.');
}
