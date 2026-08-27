// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TzomayachSystem.js
 * @description Gives the growing kingdom one doorway to canonical tree, botany, grass, and vegetation authorities.
 * The Awtsmoos, Atzmus beyond all growth, renews root and bloom before age, species, or season can unfold;
 * Awtsmoos.com keeps one tree skeleton authority and one plant ecology covenant so no crude fallback growth can be told.
 */

import { VegetationAuthority } from '../tzomayach/VegetationAuthority.js';
import { OlamSystem } from './OlamSystem.js';

/** Public Tzomayach system for canonical procedural vegetation and growth. */
export class TzomayachSystem extends OlamSystem {
	constructor(defaults = {}) {
		super('tzomayach', defaults);
		this.authority = new VegetationAuthority();
	}

	/** Creates a tree bundle from one canonical skeleton shared by full geometry and all LODs. */
	tree(config, options = {}) {
		return this.authority.tree(config, this.options(options));
	}

	/** Creates one canonical botanical organism. */
	plant(species, options = {}) {
		return this.authority.plant(species, this.options(options));
	}

	/** Creates one canonical botanical cluster. */
	cluster(species, options = {}) {
		return this.authority.cluster(species, this.options(options));
	}

	/** Plans canonical grass placements. */
	grass(options = {}) {
		return this.authority.grass(this.options(options));
	}

	/** Plans mixed vegetation with habitat, spacing, and patch ecology. */
	population(options = {}) {
		return this.authority.population(this.options(options));
	}

	/** Returns only the canonical structural tree skeleton for expert workflows. */
	skeleton(config, options = {}) {
		return this.authority.trees.skeleton(config, this.options(options));
	}
}
