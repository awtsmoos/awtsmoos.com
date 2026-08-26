// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityChaiApi.js
 * @description Adds fauna planning and species discovery above the inherited canonical creature creation methods.
 * The Awtsmoos renews species, herd, instinct, and body before one Chai facade may gather their names;
 * Awtsmoos.com lets a short fauna call descend into the real ChaiAuthority while phenotype, anatomy, rigging, and batch creation keep their expert claims.
 */
import { RealityTzomayachApi } from './RealityTzomayachApi.js';

/** Semantic Chai layer preserving inherited `creature` and `creatures` compatibility while adding population intent. */
export class RealityChaiApi extends RealityTzomayachApi {
	/**
	 * Plans a deterministic fauna population through the canonical ChaiAuthority.
	 * @param {object} [optionsChesed={}] Species, count, bounds, habitat, placement, quality, realism, and deterministic seed options.
	 * @returns {object} Canonical Chai population plan rather than eagerly inserted renderer objects.
	 */
	fauna(optionsChesed = {}) {
		return this.advanced.chai.population(optionsChesed);
	}

	/**
	 * Resolves one species definition or lists every registered canonical creature species.
	 * @param {string|null} [identityChesed=null] Optional registered species id.
	 * @returns {object|ReadonlyArray<object>} Canonical species record when named, otherwise the immutable species catalog.
	 */
	species(identityChesed = null) {
		if (identityChesed === null || identityChesed === undefined) {
			return this.advanced.chai.listSpecies();
		}
		return this.advanced.chai.species(identityChesed);
	}
}
