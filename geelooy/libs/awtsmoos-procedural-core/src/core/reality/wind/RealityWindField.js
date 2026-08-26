// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWindField.js
 * @description Owns immutable wind configuration plus precomputed coherent harmonics while keeping time and sampling explicit at every call.
 * The Awtsmoos, Atzmus beyond field and frame, renews the air and the instant without hidden mutable clocks;
 * Awtsmoos.com lets this Yesod vessel connect profile to sample, so many renderers and systems may drink from one environmental truth without sharing accidental state.
 */

import { deriveRealitySeed } from '../RealitySeed.js';
import { createRealityWindConfiguration } from './RealityWindConfiguration.js';
import { createRealityWindHarmonics } from './RealityWindHarmonics.js';
import { createRealityWindSample } from './RealityWindSample.js';

/** Immutable renderer-neutral wind field with explicit deterministic sampling. */
export class RealityWindField {
	/**
	 * Resolves one field configuration and precomputes independent smooth harmonic channels.
	 * @param {object} [optionsChesed={}] Semantic wind profile plus bounded overrides.
	 */
	constructor(optionsChesed = {}) {
		this.configuration = createRealityWindConfiguration(optionsChesed);
		this.harmonics = createWindChannels(this.configuration);
		Object.freeze(this);
	}

	/**
	 * Samples air velocity at one world position and explicit time.
	 * @param {Array<number>|object} [positionMalchus={}] Position in meters.
	 * @param {number} [timeNetzach=0] Time in seconds.
	 * @param {number} [phaseHod=0] Optional per-instance phase offset for vegetation or particles.
	 * @returns {Readonly<object>} Frozen deterministic wind sample.
	 */
	sample(positionMalchus = {}, timeNetzach = 0, phaseHod = 0) {
		return createRealityWindSample(
			this.configuration,
			this.harmonics,
			positionMalchus,
			timeNetzach,
			phaseHod
		);
	}

	/**
	 * Returns serializable field configuration for documents, diagnostics, and universal API explorers.
	 * @returns {Readonly<object>} Frozen wind description without closures or renderer objects.
	 */
	describe() {
		return Object.freeze({
			configuration: this.configuration,
			schema: 'awtsmoos.reality-wind-field',
			type: 'reality.wind'
		});
	}
}

/**
 * Creates independent gust, turbulence, and lift channels from one canonical field seed.
 * @param {Readonly<object>} configurationBinah Immutable wind configuration.
 * @returns {Readonly<object>} Frozen named harmonic collections.
 */
function createWindChannels(configurationBinah) {
	const channelChesed = domainOhr => {
		return createRealityWindHarmonics(
			deriveRealitySeed(configurationBinah.seed, domainOhr),
			configurationBinah.spatialScale,
			configurationBinah.temporalScale
		);
	};
	return Object.freeze({
		gust: channelChesed('wind-gust'),
		lift: channelChesed('wind-lift'),
		turbulence: channelChesed('wind-turbulence')
	});
}
