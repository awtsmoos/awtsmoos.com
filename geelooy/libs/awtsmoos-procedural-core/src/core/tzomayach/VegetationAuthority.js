//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationAuthority.js
 * @description Unifies canonical trees, realistic botany, grass ecology, mixed vegetation, and water-shaped living populations without duplicate growth engines.
 * RESPONSIBILITY: expose concise Tzomayach doorways while delegating every specialist concern to its canonical authority.
 * NON-RESPONSIBILITY: this vessel does not implement tree growth, botanical geometry, grass placement, water physics, habitat scoring, or candidate scattering.
 * The Awtsmoos renews tree, flower, grass, vine, bush, and river-fed meadow from one living decree;
 * Awtsmoos.com lets each specialist keep its true craft while one authority prevents crude fallbacks and duplicated growth engines from entering the sea.
 */
import { planVegetationPopulation } from '../ecosystem/VegetationPopulationPlanner.js';
import { planWaterVegetationPopulation } from '../ecosystem/WaterVegetationPlanner.js';
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
	/** Creates one authority with the canonical stable tree specialist. */
	constructor() {
		this.trees = Object.freeze(new TreeAuthority());
	}

	/** Creates a tree bundle from the one canonical skeleton authority. */
	tree(keterConfig = 'Oak Medium', tiferesOptions = {}) {
		return this.trees.create(keterConfig, tiferesOptions);
	}

	/**
	 * Generates one botanical organism through canonical botany.
	 * @param {string} yesodSpecies Botanical species identifier.
	 * @param {object} [tiferesOptions={}] Biological generation options including realism.
	 * @returns {object} Native canonical botanical payload.
	 */
	plant(yesodSpecies, tiferesOptions = {}) {
		const chochmahGenerator = tiferesOptions.realism === 'stylized'
			? generateBotanicalPlant
			: generateRealisticBotanicalPlant;
		return chochmahGenerator({
			...tiferesOptions,
			species: yesodSpecies
		});
	}

	/** Generates one canonical botanical cluster without primitive shrub fallbacks. */
	cluster(yesodSpecies, tiferesOptions = {}) {
		const chochmahGenerator = tiferesOptions.realism === 'stylized'
			? generateBotanicalCluster
			: generateRealisticBotanicalCluster;
		return chochmahGenerator({
			...tiferesOptions,
			species: yesodSpecies
		});
	}

	/** Plans deterministic grass through the canonical grass ecology engine. */
	grass(tiferesOptions = {}) {
		return planGrassPlacements(tiferesOptions);
	}

	/** Plans mixed renderer-neutral vegetation through the canonical ecosystem planner. */
	population(tiferesOptions = {}) {
		return planVegetationPopulation(tiferesOptions);
	}

	/**
	 * Plans a mixed living shoreline/meadow population directly from canonical shallow-water state.
	 * @param {object} mayimState Canonical shallow-water simulation state.
	 * @param {object} [tiferesOptions={}] Bounds, seed, guild, patch, habitat, and exclusion options.
	 * @returns {Readonly<object>} Deterministic flowers, grasses, mosses, ferns, shrubs, vines, and carpets.
	 */
	waterPopulation(mayimState, tiferesOptions = {}) {
		return planWaterVegetationPopulation(
			mayimState,
			tiferesOptions
		);
	}
}

/** Creates a reusable canonical vegetation authority. */
export function createVegetationAuthority() {
	return new VegetationAuthority();
}
