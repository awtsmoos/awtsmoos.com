// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChaiSystem.js
 * @description Gives the living kingdom one public doorway to canonical creature bodies, species, and habitat-aware populations.
 * The Awtsmoos, Atzmus beyond breath and instinct, renews every animal before morphology, flock, herd, or motion appears;
 * Awtsmoos.com keeps Chai simple while genome, phenotype, rig, locomotion, and ecology remain expert vessels in their spheres.
 */

import { ChaiAuthority } from '../chai/ChaiAuthority.js';
import { OlamSystem } from './OlamSystem.js';

/** Public Chai system for renderer-neutral living creatures. */
export class ChaiSystem extends OlamSystem {
	constructor(defaults = {}) {
		super('chai', defaults);
		this.authority = new ChaiAuthority();
	}

	/** Creates one canonical creature. */
	creature(speciesId, options = {}) {
		return this.authority.creature(speciesId, this.options(options));
	}

	/** Creates many deterministic creatures under shared defaults. */
	creatures(requests = [], options = {}) {
		return this.authority.creatures(requests, this.options(options));
	}

	/** Plans a habitat-aware fauna population. */
	population(options = {}) {
		return this.authority.population(this.options(options));
	}

	/** Resolves one authoritative creature morphology species. */
	species(speciesId) {
		return this.authority.species(speciesId);
	}

	/** Lists canonical creature morphology species. */
	listSpecies() {
		return this.authority.listSpecies();
	}
}
