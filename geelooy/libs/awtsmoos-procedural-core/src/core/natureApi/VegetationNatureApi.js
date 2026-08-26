//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file VegetationNatureApi.js
 * @description Adds simple semantic doors for flowers, grass motion, moss, vines, and patches above canonical Tzomayach generation.
 * The Awtsmoos renews meadow, blossom, and climbing vine before convenience names may divide their source;
 * Awtsmoos.com keeps one merciful surface while biology, ecology, motion, realism, and expert options remain the deeper course.
 */
import { VegetationNatureFoundationApi } from './VegetationNatureFoundationApi.js';
import {
	createFlowerNatureProfile,
	listFlowerNatureProfiles
} from './FlowerNatureProfile.js';
import { createVegetationMotionIntent } from './VegetationMotionIntent.js';

/** High-level vegetation facade with progressive disclosure rather than a second generator. */
export class VegetationNatureApi extends VegetationNatureFoundationApi {
	/**
	 * Generates a semantic botanical patch while preserving the complete canonical cluster option surface.
	 * @param {string} [yesodSpecies='daisy'] Canonical botanical species id.
	 * @param {object} [keterOptions={}] Cluster, realism, ecology, and distribution options.
	 * @returns {object} Canonical Tzomayach cluster result.
	 */
	patch(yesodSpecies = 'daisy', keterOptions = {}) {
		return this.plantCluster(yesodSpecies, {
			...keterOptions,
			distribution: keterOptions.distribution ?? 'meadow'
		});
	}

	/**
	 * Creates one canonical flower organism while preserving all plant-generation options.
	 * @param {string} [yesodSpecies='daisy'] Canonical flower species id.
	 * @param {object} [keterOptions={}] Canonical botanical generation options.
	 * @returns {object} Canonical plant result.
	 */
	flower(yesodSpecies = 'daisy', keterOptions = {}) {
		createFlowerNatureProfile(yesodSpecies);
		return this.plant(yesodSpecies, keterOptions);
	}

	/**
	 * Creates a deterministic flower patch; existing callers retain the historical cluster result contract.
	 * @param {string} [yesodSpecies='daisy'] Canonical flower species id.
	 * @param {object} [keterOptions={}] Cluster and ecology options.
	 * @returns {object} Canonical plant-cluster result.
	 */
	flowers(yesodSpecies = 'daisy', keterOptions = {}) {
		createFlowerNatureProfile(yesodSpecies);
		return this.patch(yesodSpecies, keterOptions);
	}

	/**
	 * Reveals immutable biological metadata for one canonical flower without generating geometry.
	 * @param {string} [yesodSpecies='daisy'] Canonical flower species id.
	 * @returns {Readonly<object>} Flower profile from the canonical botany catalog.
	 */
	flowerProfile(yesodSpecies = 'daisy') {
		return createFlowerNatureProfile(yesodSpecies);
	}

	/** Returns every canonical flower profile for tools, procedural selection, and discovery UIs. */
	listFlowers() {
		return listFlowerNatureProfiles();
	}

	/**
	 * Creates renderer-neutral motion/LOD intent reusable by grass, flowers, vines, leaves, and habitat systems.
	 * @param {object} [keterOptions={}] Wind, flexibility, recovery, and LOD options.
	 * @returns {Readonly<object>} Immutable vegetation motion intent.
	 */
	motion(keterOptions = {}) {
		return createVegetationMotionIntent(keterOptions);
	}

	/** Creates a low-growing moss patch with understory placement by default. */
	moss(yesodSpecies = 'sheet-moss', keterOptions = {}) {
		return this.patch(yesodSpecies, {
			...keterOptions,
			distribution: keterOptions.distribution ?? 'understory'
		});
	}

	/** Creates one guide-aware climbing vine through the canonical plant generator. */
	vine(yesodSpecies = 'english-ivy', keterOptions = {}) {
		return this.plant(yesodSpecies, keterOptions);
	}

	/** Creates a deterministic vine patch suitable for walls, edges, and bands. */
	vines(yesodSpecies = 'english-ivy', keterOptions = {}) {
		return this.patch(yesodSpecies, {
			...keterOptions,
			distribution: keterOptions.distribution ?? 'edge'
		});
	}
}
