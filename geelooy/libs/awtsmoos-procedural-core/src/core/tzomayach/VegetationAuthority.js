// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationAuthority.js
 * @description Unifies canonical trees, realistic botany, grass ecology, and mixed vegetation without duplicate growth engines.
 * The Awtsmoos, Atzmus beyond every leaf and blade, renews all Tzomayach life from one living decree;
 * Awtsmoos.com lets each specialist keep its true craft while one authority prevents crude bushes or fallback trees from entering the sea.
 * Trees always use TreeAuthority, woody and flowering plants use canonical botany, and grass uses the canonical grass planner.
 */

import { planVegetationPopulation } from '../ecosystem/VegetationPopulationPlanner.js';
import { planGrassPlacements } from '../geometry/grass/grassPlacement.js';
import {
	generateBotanicalCluster,
	generateBotanicalPlant
} from '../geometry/generators/botany/BotanicalGenerator.js';
import {
	generateRealisticBotanicalCluster,
	generateRealisticBotanicalPlant
} from '../geometry/generators/botany/BotanicalRealism.js';
import { TreeAuthority } from './TreeAuthority.js';

/** Canonical Tzomayach creation authority composed from existing specialist engines. */
export class VegetationAuthority {
	constructor() {
		this.trees = Object.freeze(new TreeAuthority());
	}

	/** Creates a tree bundle from the one canonical skeleton authority. */
	tree(config = 'Oak Medium', options = {}) {
		return this.trees.create(config, options);
	}

	/**
	 * Generates one botanical organism through canonical botany.
	 * @param {string} species Botanical species identifier.
	 * @param {object} [options={}] Biological generation options including realism.
	 * @returns {object} Native canonical botanical payload.
	 */
	plant(species, options = {}) {
		const generator = options.realism === 'stylized'
			? generateBotanicalPlant
			: generateRealisticBotanicalPlant;
		return generator({ ...options, species });
	}

	/** Generates one canonical botanical cluster without primitive shrub fallbacks. */
	cluster(species, options = {}) {
		const generator = options.realism === 'stylized'
			? generateBotanicalCluster
			: generateRealisticBotanicalCluster;
		return generator({ ...options, species });
	}

	/** Plans deterministic grass through the canonical grass ecology engine. */
	grass(options = {}) {
		return planGrassPlacements(options);
	}

	/** Plans mixed renderer-neutral vegetation through the canonical ecosystem planner. */
	population(options = {}) {
		return planVegetationPopulation(options);
	}
}

/** Creates a reusable canonical vegetation authority. */
export function createVegetationAuthority() {
	return new VegetationAuthority();
}
