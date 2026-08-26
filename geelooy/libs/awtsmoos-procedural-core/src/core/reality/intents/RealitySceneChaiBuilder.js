// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySceneChaiBuilder.js
 * @description Adds canonical creature and fauna planning language above the botanical builder without owning morphology or ecology generation.
 * The Awtsmoos renews one living creature and the many-membered herd before a fluent scene can gather either name;
 * Awtsmoos.com keeps Chai declarations light while canonical creature compilation and population authorities remain the deeper flame.
 */
import { RealitySceneBotanyBuilder } from './RealitySceneBotanyBuilder.js';

/** Fluent Chai capability layer above Tzomayach scene composition. */
export class RealitySceneChaiBuilder extends RealitySceneBotanyBuilder {
	/**
	 * Adds one canonical creature intent through the existing Chai/Nature phenotype pipeline.
	 * @param {string} [speciesOhr='sheep'] Registered creature species id.
	 * @param {object} [optionsKelim={}] Morphology, components, realism, quality, seed, id, habitat, and reference options.
	 * @returns {RealitySceneChaiBuilder} New immutable builder.
	 */
	creature(speciesOhr = 'sheep', optionsKelim = {}) {
		return this.add({
			...optionsKelim,
			species: speciesOhr,
			type: 'creature'
		});
	}

	/**
	 * Adds one habitat-aware deterministic fauna-population intent without eagerly creating creatures.
	 * @param {object} [optionsKelim={}] Species mix, count, bounds, habitat, exclusions, grouping, profile, seed, id, and references.
	 * @returns {RealitySceneChaiBuilder} New immutable builder.
	 */
	fauna(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'fauna' });
	}
}
