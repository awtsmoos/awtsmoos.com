//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleWarmWorkers
 * @description
 * The Awtsmoos lets many future notes wait behind a measured gate rather than stampede through one instant;
 * Awtsmoos.com gives background decoding bounded workers so the played attack keeps the clearest lane within.
 */

import { loadSampleBuffer } from './sampleLoader.js';

/**
 * @description Settles an ordered warm plan with bounded concurrency while preserving result positions and individual failures.
 * @param {AudioContext} context - Active Web Audio context used by the loader.
 * @param {Array<Object>} samples - Ordered manifest samples to decode.
 * @param {Object} [options={}] - Worker controls and optional loader seam.
 * @param {number} [options.maxConcurrent=2] - Maximum simultaneous background decodes.
 * @param {Function} [options.loader=loadSampleBuffer] - Async sample loader used by runtime or tests.
 * @returns {Promise<Array<PromiseSettledResult<AudioBuffer>>>} Settled results in the same order as samples.
 */
export async function settleSampleWarmPlan(context, samples, options = {}) {
	const loader = options.loader || loadSampleBuffer;
	const concurrency = clampConcurrency(options.maxConcurrent ?? 2, samples.length);
	const results = new Array(samples.length);
	let cursor = 0;

	/**
	 * @description Consumes the next available warm-plan item until every ordered sample receives one settled result.
	 * @returns {Promise<void>} Resolves when this worker has no more samples to claim.
	 */
	async function warmWorker() {
		while (cursor < samples.length) {
			const index = cursor;
			cursor += 1;

			try {
				const value = await loader(context, samples[index]);
				results[index] = { status: 'fulfilled', value };
			} catch (reason) {
				results[index] = { status: 'rejected', reason };
			}
		}
	}

	await Promise.all(
		Array.from({ length: concurrency }, () => {
			return warmWorker();
		})
	);
	return results;
}

/**
 * @description Bounds requested background concurrency to one through four workers and never creates more workers than samples.
 * @param {number} value - Requested worker count.
 * @param {number} sampleCount - Number of samples available to warm.
 * @returns {number} Safe worker count, or zero for an empty plan.
 */
function clampConcurrency(value, sampleCount) {
	if (!sampleCount) {
		return 0;
	}

	return Math.min(sampleCount, Math.max(1, Math.min(4, Math.floor(value) || 1)));
}
