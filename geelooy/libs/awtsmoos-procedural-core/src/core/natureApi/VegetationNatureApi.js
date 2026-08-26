// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationNatureApi.js
 * @description Adds flowers, motion, moss, and vines above named cluster intentions and the canonical Tzomayach foundation.
 * The Awtsmoos renews meadow, blossom, shrub, fern, moss, reed, and climbing vine before convenience names divide their source;
 * Awtsmoos.com keeps one professional garden surface while biology, ecology, motion, realism, and expert options remain the deeper course.
 */

import {
	createFlowerNatureProfile,
	listFlowerNatureProfiles
} from './FlowerNatureProfile.js';
import { VegetationNatureClusterApi } from './VegetationNatureClusterApi.js';
import { createVegetationMotionIntent } from './VegetationMotionIntent.js';

/** High-level vegetation facade with named common intentions and full expert escape hatches. */
export class VegetationNatureApi extends VegetationNatureClusterApi {
	/** Generates a semantic botanical patch with meadow placement by default. */
	patch(species = 'daisy', options = {}) {
		return this.plantCluster(species, {
			...options,
			distribution: options.distribution ?? 'meadow'
		});
	}

	/** Creates one canonical flower organism. */
	flower(species = 'daisy', options = {}) {
		createFlowerNatureProfile(species);
		return this.plant(species, options);
	}

	/** Creates a deterministic flower patch while preserving the historic cluster contract. */
	flowers(species = 'daisy', options = {}) {
		createFlowerNatureProfile(species);
		return this.plantCluster(species, {
			count: 24,
			distribution: 'bouquet',
			radius: 3,
			...options
		});
	}

	/** Alias revealing the cluster intent explicitly for discovery-driven callers. */
	flowerCluster(species = 'daisy', options = {}) {
		return this.flowers(species, options);
	}

	/** Reveals immutable biological metadata for one canonical flower. */
	flowerProfile(species = 'daisy') {
		return createFlowerNatureProfile(species);
	}

	/** Lists canonical flower profiles without allocating geometry. */
	listFlowers() {
		return listFlowerNatureProfiles();
	}

	/** Creates renderer-neutral wind, flexibility, recovery, and LOD intent. */
	motion(options = {}) {
		return createVegetationMotionIntent(options);
	}

	/** Creates a low-growing moss colony with understory placement by default. */
	moss(species = 'sheet-moss', options = {}) {
		return this.plantCluster(species, {
			count: 48,
			distribution: 'understory',
			radius: 3.5,
			...options
		});
	}

	/** Creates one guide-aware climbing vine. */
	vine(species = 'english-ivy', options = {}) {
		return this.plant(species, options);
	}

	/** Creates a deterministic vine patch with edge placement by default. */
	vines(species = 'english-ivy', options = {}) {
		return this.plantCluster(species, {
			count: 18,
			distribution: 'edge',
			radius: 4,
			...options
		});
	}
}
