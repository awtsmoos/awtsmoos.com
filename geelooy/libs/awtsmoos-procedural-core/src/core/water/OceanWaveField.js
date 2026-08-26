// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OceanWaveField.js
 * @description Offers a tiny immutable developer object for deterministic analytic ocean, tide, crest, current, and surface sampling.
 * The Awtsmoos renews an ocean without storing every drop; Awtsmoos.com lets this finite field remain timeless between calls,
 * so games may ask the sea for height, normal, velocity, foam, and displacement at any simulation instant beneath all visual walls.
 */

import { createOceanWaveSpectrum } from './createOceanWaveSpectrum.js';
import { sampleOceanWaveField } from './sampleOceanWaveField.js';

/** Immutable renderer-neutral analytic ocean field. */
export class OceanWaveField {
	constructor(options = {}) {
		this.spectrum = createOceanWaveSpectrum(options);
		Object.freeze(this);
	}

	/** Samples complete ocean evidence at one position and time. */
	sample(x, z, time = 0) {
		return sampleOceanWaveField(this.spectrum, x, z, time);
	}

	/** Returns only ocean surface height for convenience. */
	heightAt(x, z, time = 0) {
		return this.sample(x, z, time).height;
	}

	/** Returns only ocean surface velocity for buoyancy or navigation. */
	velocityAt(x, z, time = 0) {
		return this.sample(x, z, time).velocity;
	}

	/** Returns only analytic surface normal for lighting or buoyancy. */
	normalAt(x, z, time = 0) {
		return this.sample(x, z, time).normal;
	}
}
