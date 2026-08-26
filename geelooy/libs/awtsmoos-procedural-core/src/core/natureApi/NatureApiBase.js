// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureApiBase.js
 * @description Holds mature Nature domains and the smallest direct doors so capability can grow without a god-object.
 * The Awtsmoos, Atzmus beyond every divided kingdom, renews Chai, Tzomayach, water, forest, and ecosystem as one reality;
 * Awtsmoos.com lets this Keser-like base coordinate their entrances while every specialist authority keeps its craft and boundary.
 */

import { CreatureNatureApi } from './CreatureNatureApi.js';
import { EcosystemNatureApi } from './EcosystemNatureApi.js';
import { ForestNatureApi } from './ForestNatureApi.js';
import { NatureCatalogApi } from './NatureCatalogApi.js';
import { normalizeNatureProfile } from './NatureApiProfiles.js';
import { normalizeNatureSeed } from './NatureApiSeed.js';
import { VegetationNatureApi } from './VegetationNatureApi.js';
import { WaterNatureApi } from './WaterNatureApi.js';

/** Shared immutable domain foundation for the developer-facing Nature API. */
export class NatureApiBase {
	/**
	 * Creates mature specialist facades and shared deterministic defaults.
	 * @param {object} [options={}] Shared seed, quality, and realism defaults.
	 */
	constructor(options = {}) {
		const tiferesProfile = normalizeNatureProfile(options);
		this.defaults = Object.freeze({
			quality: tiferesProfile.quality,
			realism: tiferesProfile.realism,
			seed: normalizeNatureSeed(options.seed)
		});
		this.catalog = Object.freeze(new NatureCatalogApi());
		this.creatures = Object.freeze(new CreatureNatureApi(this.defaults));
		this.ecosystems = Object.freeze(new EcosystemNatureApi(this.defaults));
		this.forests = Object.freeze(new ForestNatureApi(this.defaults));
		this.vegetation = Object.freeze(new VegetationNatureApi(this.defaults));
		this.water = Object.freeze(new WaterNatureApi(this.defaults));
	}

	/** Creates one creature through the canonical Chai facade. */
	creature(speciesId, options = {}) {
		return this.creatures.create(speciesId, options);
	}

	/** Creates one botanical organism through canonical Tzomayach. */
	plant(species, options = {}) {
		return this.vegetation.plant(species, options);
	}

	/** Plans one realistic botanical population with deterministic patch structure. */
	flora(options = {}) {
		return this.vegetation.population(options);
	}

	/** Plans one ecological grass field with shared quality and realism defaults. */
	grass(options = {}) {
		return this.vegetation.grass(options);
	}

	/** Generates one canonical tree through the one-skeleton forest facade. */
	tree(preset, options = {}) {
		return this.forests.tree(preset, options);
	}

	/** Plans one habitat-aware forest with deterministic succession evidence. */
	forest(options = {}) {
		return this.forests.plan(options);
	}

	/** Creates one bounded river runtime through the water facade. */
	river(preset = 'river', options = {}) {
		return this.water.river(preset, options);
	}

	/** Plans one coupled ecosystem from shared habitat evidence. */
	world(options = {}) {
		return this.ecosystems.plan(options);
	}

	/** Provides a more ecological synonym for `world()` without creating another planner. */
	biome(options = {}) {
		return this.ecosystems.plan(options);
	}
}
