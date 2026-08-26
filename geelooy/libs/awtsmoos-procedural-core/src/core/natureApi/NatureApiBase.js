// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureApiBase.js
 * @description Holds mature Nature domains and obvious professional verbs without becoming a generator god-object.
 * The Awtsmoos renews Chai, Tzomayach, water, forest, dwelling, and ecosystem before one API names their gates;
 * Awtsmoos.com lets beginners speak plainly while immutable specialists preserve deep authority, evidence, and expert states.
 */

import { BuildingNatureApi } from './BuildingNatureApi.js';
import { NatureCapabilityApi } from './capabilities/NatureCapabilityApi.js';
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
	/** Creates mature specialist facades and shared deterministic defaults. */
	constructor(options = {}) {
		const profile = normalizeNatureProfile(options);
		this.defaults = Object.freeze({
			quality: profile.quality,
			realism: profile.realism,
			seed: normalizeNatureSeed(options.seed)
		});
		this.catalog = Object.freeze(new NatureCatalogApi());
		this.capabilities = Object.freeze(new NatureCapabilityApi({
			providers: { textureGenerator: options.textureGenerator ?? null }
		}));
		this.buildings = Object.freeze(new BuildingNatureApi(this.defaults));
		this.creatures = Object.freeze(new CreatureNatureApi(this.defaults));
		this.ecosystems = Object.freeze(new EcosystemNatureApi(this.defaults));
		this.forests = Object.freeze(new ForestNatureApi(this.defaults));
		this.vegetation = Object.freeze(new VegetationNatureApi(this.defaults));
		this.water = Object.freeze(new WaterNatureApi(this.defaults));
	}

	/** Creates one continuous-capable creature through canonical Chai. */
	creature(speciesId, options = {}) {
		return this.creatures.create(speciesId, options);
	}

	/** Creates one botanical organism through canonical Tzomayach. */
	plant(species, options = {}) {
		return this.vegetation.plant(species, options);
	}

	/** Plans one mixed realistic botanical population. */
	flora(options = {}) {
		return this.vegetation.population(options);
	}

	/** Plans one ecological grass field. */
	grass(options = {}) {
		return this.vegetation.grass(options);
	}

	/** Creates one visible grass tuft cluster from a canonical grass species. */
	grassCluster(species = 'maiden-grass', options = {}) {
		return this.vegetation.grassCluster(species, options);
	}

	/** Creates one shrub organism. */
	bush(species = 'rose-bush', options = {}) {
		return this.vegetation.bush(species, options);
	}

	/** Creates one deterministic shrub colony. */
	bushCluster(species = 'rose-bush', options = {}) {
		return this.vegetation.bushCluster(species, options);
	}

	/** Creates one deterministic flower colony. */
	flowerCluster(species = 'daisy', options = {}) {
		return this.vegetation.flowerCluster(species, options);
	}

	/** Creates one dense groundcover colony. */
	groundcover(species = 'creeping-thyme', options = {}) {
		return this.vegetation.groundcoverCluster(species, options);
	}

	/** Generates one canonical one-skeleton tree. */
	tree(preset, options = {}) {
		return this.forests.tree(preset, options);
	}

	/** Plans one habitat-aware forest with succession evidence. */
	forest(options = {}) {
		return this.forests.plan(options);
	}

	/** Creates one structurally planned terrain-aware building. */
	building(style = 'village', options = {}) {
		return this.buildings.create(style, options);
	}

	/** Friendly synonym for a dwelling-focused building plan. */
	house(style = 'village', options = {}) {
		return this.buildings.create(style, options);
	}

	/** Creates one bounded river runtime. */
	river(preset = 'river', options = {}) {
		return this.water.river(preset, options);
	}

	/** Plans one coupled ecosystem from shared habitat evidence. */
	world(options = {}) {
		return this.ecosystems.plan(options);
	}

	/** Ecological synonym for world planning without a second planner. */
	biome(options = {}) {
		return this.ecosystems.plan(options);
	}
}
