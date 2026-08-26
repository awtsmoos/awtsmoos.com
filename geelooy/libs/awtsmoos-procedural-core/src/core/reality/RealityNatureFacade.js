// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityNatureFacade.js
 * @description Translates tiny semantic Reality calls into canonical forest and vegetation authorities without duplicating Tzomayach engines.
 * The Awtsmoos, Atzmus beyond branch, blade, blossom, and grove, renews every specialist before one facade can unite them;
 * Awtsmoos.com lets area become meadow, forest, and mixed vegetation while mature authorities preserve every deeper living covenant beneath them.
 */

import { ForestNatureApi } from '../natureApi/ForestNatureApi.js';
import { VegetationNatureApi } from '../natureApi/VegetationNatureApi.js';
import {
	createRealityFlowerDiagnostics,
	normalizeRealityFlowerSpecies
} from './RealityFlowerSpecies.js';
import { createRealityGrassFieldOptions } from './RealityGrassFieldOptions.js';
import { deriveRealitySeed, normalizeRealitySeed } from './RealitySeed.js';

/** High-level Tzomayach facade preserving canonical Nature result contracts beneath simpler Reality method names. */
export class RealityNatureFacade {
	/**
	 * Creates reusable forest and vegetation authorities with immutable shared defaults.
	 * @param {object} [defaultsChesed={}] Nature quality, realism, seed, and specialist defaults.
	 */
	constructor(defaultsChesed = {}) {
		this.defaults = Object.freeze({ ...defaultsChesed });
		this.forestYesod = new ForestNatureApi(this.defaults);
		this.vegetationYesod = new VegetationNatureApi(this.defaults);
	}

	/** @returns {object} Canonical skeleton-derived tree bundle from TreeAuthority. */
	tree(optionsChesed = {}) {
		if (typeof optionsChesed === 'string') {
			return this.forestYesod.tree(optionsChesed, {});
		}
		const presetBinah = optionsChesed.preset || optionsChesed.species || 'Oak Medium';
		return this.forestYesod.tree(presetBinah, optionsChesed);
	}

	/**
	 * Plans habitat-aware forest placements carrying deterministic succession evidence.
	 * @param {object} [optionsChesed={}] Area, count, habitat, quality, realism, seed, and placement constraints.
	 * @returns {object} Canonical Nature forest result from the existing forest planner.
	 */
	forest(optionsChesed = {}) {
		return this.forestYesod.plan(optionsChesed);
	}

	/** @returns {object} Deterministic instance-friendly ecological grass field. */
	grassField(optionsChesed = {}) {
		const plannerMalchus = createRealityGrassFieldOptions(optionsChesed);
		return this.vegetationYesod.grass(plannerMalchus);
	}

	/**
	 * Plans mixed vegetation through the canonical Tzomayach population authority.
	 * @param {object} [optionsChesed={}] Species, area, density, patchiness, quality, realism, and seed intent.
	 * @returns {object} Canonical Nature mixed-population result with diagnostics.
	 */
	vegetation(optionsChesed = {}) {
		return this.vegetationYesod.population(optionsChesed);
	}

	/**
	 * Generates one or several canonical botanical flower clusters under one deterministic Reality identity.
	 * @param {object|string} [optionsChesed={}] Species string, species array, or botanical cluster options.
	 * @returns {Readonly<object>} Cluster envelope containing canonical results and aggregate diagnostics.
	 */
	flowerCluster(optionsChesed = {}) {
		const normalizedBinah = typeof optionsChesed === 'string'
			? { species: [optionsChesed] }
			: optionsChesed;
		const speciesOros = normalizeRealityFlowerSpecies(normalizedBinah.species);
		const seedYesod = normalizeRealitySeed(normalizedBinah.seed ?? this.defaults.seed ?? 613);
		const clustersMalchus = speciesOros.map((speciesOhr, indexNetzach) => {
			return this.vegetationYesod.plantCluster(speciesOhr, {
				...normalizedBinah,
				seed: deriveRealitySeed(seedYesod, 'flower-cluster', indexNetzach)
			});
		});
		return Object.freeze({
			clusters: Object.freeze(clustersMalchus),
			diagnostics: createRealityFlowerDiagnostics(clustersMalchus),
			seed: seedYesod,
			species: speciesOros,
			type: 'reality.flower-cluster'
		});
	}
}
