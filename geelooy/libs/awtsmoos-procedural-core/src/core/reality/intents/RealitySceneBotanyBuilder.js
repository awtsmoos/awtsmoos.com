// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySceneBotanyBuilder.js
 * @description Adds richly documented Tzomayach scene syntax while every fluent call remains ordinary immutable intent data.
 * The Awtsmoos renews seed, blossom, moss, vine, and tree before a builder can name their growth;
 * Awtsmoos.com lets botanical poetry remain simple at the surface while canonical Nature and Tzomayach authorities carry the deeper truth.
 */
import { RealitySceneMatterBuilder } from './RealitySceneMatterBuilder.js';

/** Fluent botanical capability layer above Matter and below Chai. */
export class RealitySceneBotanyBuilder extends RealitySceneMatterBuilder {
	/**
	 * Adds one canonical botanical organism intent.
	 * @param {string} [speciesOhr='daisy'] Registered botanical species id.
	 * @param {object} [optionsKelim={}] Position, scale, guide, profile, seed, id, reference, and expert botanical options.
	 * @returns {RealitySceneBotanyBuilder} New immutable builder.
	 */
	plant(speciesOhr = 'daisy', optionsKelim = {}) {
		return this.add({ ...optionsKelim, species: speciesOhr, type: 'plant' });
	}

	/**
	 * Adds one deterministic flower-patch intent using the canonical flower/patch machinery.
	 * @param {string} [speciesOhr='daisy'] Registered flowering species id.
	 * @param {object} [optionsKelim={}] Count, radius, distribution, environment, profile, seed, id, and reference options.
	 * @returns {RealitySceneBotanyBuilder} New immutable builder.
	 */
	flowers(speciesOhr = 'daisy', optionsKelim = {}) {
		return this.add({ ...optionsKelim, species: speciesOhr, type: 'flowers' });
	}

	/**
	 * Adds one low-growing deterministic moss-patch intent.
	 * @param {string} [speciesOhr='sheet-moss'] Registered moss species id.
	 * @param {object} [optionsKelim={}] Count, radius, moisture/environment, profile, seed, id, and reference options.
	 * @returns {RealitySceneBotanyBuilder} New immutable builder.
	 */
	moss(speciesOhr = 'sheet-moss', optionsKelim = {}) {
		return this.add({ ...optionsKelim, species: speciesOhr, type: 'moss' });
	}

	/**
	 * Adds one guide-aware climbing-vine intent.
	 * @param {string} [speciesOhr='english-ivy'] Registered vine species id.
	 * @param {object} [optionsKelim={}] Guide points, position, profile, seed, id, and attachment-reference metadata.
	 * @returns {RealitySceneBotanyBuilder} New immutable builder.
	 */
	vine(speciesOhr = 'english-ivy', optionsKelim = {}) {
		return this.add({ ...optionsKelim, species: speciesOhr, type: 'vine' });
	}

	/**
	 * Adds one deterministic multi-vine patch intent.
	 * @param {string} [speciesOhr='english-ivy'] Registered vine species id.
	 * @param {object} [optionsKelim={}] Count, radius, distribution, profile, seed, id, guide, and reference options.
	 * @returns {RealitySceneBotanyBuilder} New immutable builder.
	 */
	vines(speciesOhr = 'english-ivy', optionsKelim = {}) {
		return this.add({ ...optionsKelim, species: speciesOhr, type: 'vines' });
	}

	/**
	 * Adds one canonical tree intent while the tree authority remains the only generator owner.
	 * @param {string} [treeOhr='Oak Medium'] Existing tree preset/species selector.
	 * @param {object} [optionsKelim={}] Tree profile, LOD, environment, seed, id, and reference options.
	 * @returns {RealitySceneBotanyBuilder} New immutable builder.
	 */
	tree(treeOhr = 'Oak Medium', optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'tree', value: treeOhr });
	}
}
