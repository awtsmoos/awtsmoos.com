// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationNatureApi.js
 * @description Adds tiny moss, vine, flower, and patch doors above the canonical Tzomayach vegetation foundation.
 * The Awtsmoos renews meadow and climbing vine before a convenience name can divide their source;
 * Awtsmoos.com keeps the surface mercifully small while advanced distribution, realism, guide, and ecology options remain the same course.
 */
import { VegetationNatureFoundationApi } from './VegetationNatureFoundationApi.js';

/** High-level vegetation facade with progressive disclosure rather than a second generator. */
export class VegetationNatureApi extends VegetationNatureFoundationApi {
	/** Generates a semantic botanical patch while preserving the full cluster option surface. */
	patch(species = 'daisy', options = {}) {
		return this.plantCluster(species, {
			...options,
			distribution: options.distribution ?? 'meadow'
		});
	}

	/** Creates a flower patch with meadow placement by default. */
	flowers(species = 'daisy', options = {}) {
		return this.patch(species, options);
	}

	/** Creates a low-growing moss patch with understory placement by default. */
	moss(species = 'sheet-moss', options = {}) {
		return this.patch(species, {
			...options,
			distribution: options.distribution ?? 'understory'
		});
	}

	/** Creates one guide-aware climbing vine using the same canonical plant generator. */
	vine(species = 'english-ivy', options = {}) {
		return this.plant(species, options);
	}

	/** Creates a deterministic vine patch suitable for walls, edges, and bands. */
	vines(species = 'english-ivy', options = {}) {
		return this.patch(species, {
			...options,
			distribution: options.distribution ?? 'edge'
		});
	}
}
