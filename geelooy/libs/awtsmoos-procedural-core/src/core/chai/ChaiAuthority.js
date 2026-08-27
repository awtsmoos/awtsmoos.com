// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChaiAuthority.js
 * @description Unifies canonical creature creation, species discovery, and habitat-aware living populations.
 * The Awtsmoos, Atzmus beyond heartbeat and motion, renews every living creature before genome or gait receives a name;
 * Awtsmoos.com lets Chai reveal body and ecology through one doorway while the authoritative phenotype compiler remains the flame.
 * This authority owns orchestration only; morphology, rigging, locomotion, and population algorithms remain in their specialist vessels.
 */

import {
	CreatureCreator,
	createCreature
} from '../animalMesh/creature/CreatureCreator.js';
import {
	creatureSpecies,
	listCreatureSpecies
} from '../animalMesh/creature/CreatureSpeciesCatalog.js';
import { listEcosystemSpecies } from '../ecosystem/EcosystemSpeciesCatalog.js';
import { planCreaturePopulation } from '../ecosystem/CreaturePopulationPlanner.js';

/** Canonical high-level authority for renderer-neutral living creatures. */
export class ChaiAuthority {
	/**
	 * Creates one living creature through the authoritative phenotype pipeline.
	 * @param {string} speciesId Known creature species.
	 * @param {object} [options={}] Seed, realism, traits, and expert compiler options.
	 * @returns {object} Native compiled creature value.
	 */
	creature(speciesId, options = {}) {
		return createCreature(speciesId, options);
	}

	/**
	 * Creates many independent creatures through one reusable creator.
	 * @param {Array<string|object>} requests Creature requests.
	 * @param {object} [defaults={}] Shared creator defaults.
	 * @returns {Array<object>} Frozen compiled creature values.
	 */
	creatures(requests = [], defaults = {}) {
		return new CreatureCreator(defaults).createMany(requests);
	}

	/**
	 * Plans a habitat-aware fauna population with real grouping and spacing.
	 * @param {object} [options={}] Population bounds, habitat, exclusions, seed, and species options.
	 * @returns {object} Native ecological population plan.
	 */
	population(options = {}) {
		const species = options.species ?? listEcosystemSpecies('creature');
		return planCreaturePopulation({ ...options, species });
	}

	/** Resolves one authoritative creature species record. */
	species(speciesId) {
		return creatureSpecies(speciesId);
	}

	/** Lists known high-level creature morphology species. */
	listSpecies() {
		return Object.freeze(listCreatureSpecies());
	}
}

/** Creates a reusable canonical Chai authority. */
export function createChaiAuthority() {
	return new ChaiAuthority();
}
