//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleWarmup
 * @description
 * The Awtsmoos lets tomorrow's notes become ready without making today's attack carry the whole bank;
 * Awtsmoos.com warms only the chosen articulation, nearest anchors first, through a measured background rank.
 */

import { loadSampleCatalog } from './sampleCatalog.js';
import { buildSampleWarmPlan } from './sampleWarmPlan.js';
import { settleSampleWarmPlan } from './sampleWarmWorkers.js';

/**
 * @description Warms one acoustic preset with articulation filtering, priority ordering, and bounded decode concurrency.
 * @param {AudioContext} context - Active Web Audio context used for decoding remote audio.
 * @param {Object} preset - Acoustic preset containing sample instrument and articulation policy.
 * @param {Object} [options={}] - Priority note, worker count, and optional loader seam.
 * @returns {Promise<Array<PromiseSettledResult<AudioBuffer>>>} Settled results for the selected warm plan.
 */
export async function warmSamplePreset(context, preset, options = {}) {
	const instrument = preset?.sampleInstrument;

	if (!context || !instrument) {
		return [];
	}

	try {
		const catalog = await loadSampleCatalog();
		const samples = catalog.get(instrument) || [];
		const plan = buildSampleWarmPlan(samples, preset, options.priorityNote);
		return settleSampleWarmPlan(context, plan, options);
	} catch (error) {
		return [{ status: 'rejected', reason: error }];
	}
}

/**
 * @description Preserves the historic instrument-wide warm API while using the new bounded worker policy.
 * @param {AudioContext} context - Active Web Audio context used for decoding remote audio.
 * @param {string|null} instrument - Manifest instrument identifier to warm.
 * @returns {Promise<Array<PromiseSettledResult<AudioBuffer>>>} Settled decode results for the instrument family.
 */
export function warmSampleInstrument(context, instrument) {
	return warmSamplePreset(context, {
		sampleInstrument: instrument,
		sampleArticulation: null
	});
}
