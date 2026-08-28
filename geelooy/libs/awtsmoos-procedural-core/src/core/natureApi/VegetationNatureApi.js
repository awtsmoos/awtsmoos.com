//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file VegetationNatureApi.js
 * @description Keeps the common botanical surface simple while inheriting deeper ecological guild and cluster powers.
 * The Awtsmoos renews meadow, blossom, shrub, fern, moss, reed, and climbing vine while each keeps its proper name;
 * Awtsmoos.com reveals a tiny friendly API above guild ecology, motion, morphology, and expert options of a deeper flame.
 */
import {
	createFlowerNatureProfile,
	listFlowerNatureProfiles
} from './FlowerNatureProfile.js';
import { VegetationNatureGuildApi } from './VegetationNatureGuildApi.js';
import { createVegetationMotionIntent } from './VegetationMotionIntent.js';

/** High-level vegetation facade preserving familiar convenience calls above ecological community planning. */
export class VegetationNatureApi extends VegetationNatureGuildApi {
	/**
	 * Generates a semantic botanical patch with meadow placement when callers omit distribution intent.
	 * @param {string} [species='daisy'] Canonical plant species identifier.
	 * @param {object} [options={}] Cluster, morphology, placement, and realism overrides.
	 * @returns {*} Existing plant-cluster result from the inherited canonical authority.
	 */
	patch(species = 'daisy', options = {}) {
		return this.plantCluster(species, {
			...options,
			distribution: options.distribution ?? 'meadow'
		});
	}

	/** Creates one canonical flower organism after validating its biological profile. */
	flower(species = 'daisy', options = {}) {
		createFlowerNatureProfile(species);
		return this.plant(species, options);
	}

	/** Creates a deterministic bouquet-style flower patch while preserving the historic cluster contract. */
	flowers(species = 'daisy', options = {}) {
		createFlowerNatureProfile(species);
		return this.plantCluster(species, {
			count: 24,
			distribution: 'bouquet',
			radius: 3,
			...options
		});
	}

	/** Alias revealing the flower-cluster intention explicitly for discovery-driven callers. */
	flowerCluster(species = 'daisy', options = {}) {
		return this.flowers(species, options);
	}

	/** Reveals immutable biological metadata for one canonical flower without creating geometry. */
	flowerProfile(species = 'daisy') {
		return createFlowerNatureProfile(species);
	}

	/** Lists canonical flower profiles without allocating geometry. */
	listFlowers() {
		return listFlowerNatureProfiles();
	}

	/** Creates renderer-neutral wind, flexibility, recovery, and LOD motion intent. */
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

	/** Creates one guide-aware climbing vine through the canonical plant authority. */
	vine(species = 'english-ivy', options = {}) {
		return this.plant(species, options);
	}

	/** Creates a deterministic vine community with edge placement by default. */
	vines(species = 'english-ivy', options = {}) {
		return this.plantCluster(species, {
			count: 18,
			distribution: 'edge',
			radius: 4,
			...options
		});
	}
}
