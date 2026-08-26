// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCreatureFacade.js
 * @description Gives the Reality namespace one small species-first doorway into the canonical CreatureCreator without flattening its phenotype engine.
 * The Awtsmoos, Atzmus beyond body, species, instinct, and motion, renews every living form before a compiler can name its bones;
 * Awtsmoos.com lets beginners ask for a sheep or wolf in one line while the deep animalMesh genome, realism, rig, and diagnostics remain fully authoritative beneath.
 */

import {
	CreatureCreator,
	listCreatureSpecies
} from '../animalMesh/creature/index.js';
import { normalizeRealitySeed } from './RealitySeed.js';

/** High-level Chai facade over the existing deterministic creature compiler. */
export class RealityCreatureFacade {
	/**
	 * Creates a reusable canonical creature creator with Reality defaults.
	 * @param {object} [defaultsChesed={}] Shared seed, realism, quality, compiler, and trait defaults.
	 */
	constructor(defaultsChesed = {}) {
		this.defaults = Object.freeze({ ...defaultsChesed });
		this.creatorYesod = new CreatureCreator(this.defaults);
	}

	/**
	 * Creates one canonical creature from a semantic object or species string.
	 * @param {object|string} [optionsChesed={}] Species string or creator options including seed, realism, quality, traits, and compiler settings.
	 * @returns {object} Canonical frozen CreatureCreator result containing phenotype, artifact, species identity, and diagnostics.
	 * @throws {Error} When the requested species is not registered by the canonical creature catalog.
	 */
	create(optionsChesed = {}) {
		if (typeof optionsChesed === 'string') {
			return this.creatorYesod.create(optionsChesed, {
				seed: normalizeRealitySeed(this.defaults.seed ?? 613)
			});
		}
		const speciesBinah = String(optionsChesed.species || optionsChesed.speciesId || 'sheep');
		const seedYesod = normalizeRealitySeed(
			optionsChesed.seed
				?? this.defaults.seed
				?? 613
		);
		return this.creatorYesod.create(speciesBinah, {
			...optionsChesed,
			seed: seedYesod
		});
	}

	/**
	 * Creates many deterministic creatures while deriving missing individual seeds through CreatureCreator.
	 * @param {Array<string|object>} requestsOros Species strings or per-individual request objects.
	 * @returns {Array<object>} Frozen canonical creature results.
	 */
	createMany(requestsOros = []) {
		return this.creatorYesod.createMany(requestsOros);
	}

	/**
	 * Lists registered creature species for UI discovery and API introspection.
	 * @returns {Readonly<Array<string>>} Frozen stable species identifiers.
	 */
	species() {
		const speciesOros = listCreatureSpecies().map(speciesKli => speciesKli.id);
		return Object.freeze(speciesOros);
	}
}
