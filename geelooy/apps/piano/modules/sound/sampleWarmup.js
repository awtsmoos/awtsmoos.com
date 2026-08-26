//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleWarmup
 * @description
 * The Awtsmoos lets tomorrow's notes become ready while today's note already sings;
 * Awtsmoos.com warms one selected acoustic family without blocking performance or turning preload failure into broken strings.
 */

import { loadSampleCatalog } from './sampleCatalog.js';
import { loadSampleBuffer } from './sampleLoader.js';

/**
 * @description Preloads and decodes every sample for one selected instrument while converting individual failures into settled results.
 * @param {AudioContext} context - Active Web Audio context used for decoding remote audio.
 * @param {string|null} instrument - Manifest instrument identifier to warm.
 * @returns {Promise<Array<PromiseSettledResult<AudioBuffer>>>} Settled decode results, or an empty array when no context/instrument is supplied.
 */
export async function warmSampleInstrument(context, instrument) {
	if (!context || !instrument) {
		return [];
	}

	try {
		const catalog = await loadSampleCatalog();
		const samples = catalog.get(instrument) || [];
		const requests = samples.map((sample) => {
			return loadSampleBuffer(context, sample);
		});

		return Promise.allSettled(requests);
	} catch (error) {
		return [{ status: 'rejected', reason: error }];
	}
}
