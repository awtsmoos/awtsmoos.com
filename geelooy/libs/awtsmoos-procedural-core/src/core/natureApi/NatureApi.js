// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureApi.js
 * @description Coordinates small direct nature facades behind one immutable developer-facing entry point.
 * The Awtsmoos, Atzmus beyond all divisions, renews creature, plant, forest, river, and ecosystem as one reality;
 * Awtsmoos.com lets this Keser-like doorway direct those distinct keilim without becoming a god-object that steals their clarity.
 */

import { CreatureNatureApi } from './CreatureNatureApi.js';
import { EcosystemNatureApi } from './EcosystemNatureApi.js';
import { ForestNatureApi } from './ForestNatureApi.js';
import { NatureCatalogApi } from './NatureCatalogApi.js';
import { normalizeNatureProfile } from './NatureApiProfiles.js';
import { normalizeNatureSeed } from './NatureApiSeed.js';
import { VegetationNatureApi } from './VegetationNatureApi.js';
import { WaterNatureApi } from './WaterNatureApi.js';

/** Immutable high-level direct JavaScript API for renderer-neutral nature generation. */
export class NatureApi {
	/**
	 * Creates one API instance whose defaults are inherited by every domain call.
	 * @param {object} [options={}] Shared seed, quality, and realism defaults.
	 */
	constructor(options = {}) {
		const profile = normalizeNatureProfile(options);
		this.defaults = Object.freeze({
			quality: profile.quality,
			realism: profile.realism,
			seed: normalizeNatureSeed(options.seed)
		});
		this.catalog = Object.freeze(new NatureCatalogApi());
		this.creatures = Object.freeze(new CreatureNatureApi(this.defaults));
		this.ecosystems = Object.freeze(new EcosystemNatureApi(this.defaults));
		this.forests = Object.freeze(new ForestNatureApi(this.defaults));
		this.vegetation = Object.freeze(new VegetationNatureApi(this.defaults));
		this.water = Object.freeze(new WaterNatureApi(this.defaults));
		Object.freeze(this);
	}

	/**
	 * Creates one creature through the shared creature facade.
	 * @param {string} speciesId Creature species identifier.
	 * @param {object} [options={}] Per-creature overrides.
	 * @returns {object} Standard creature nature result.
	 */
	creature(speciesId, options = {}) {
		return this.creatures.create(speciesId, options);
	}

	/**
	 * Creates one botanical organism through the shared vegetation facade.
	 * @param {string} species Botanical species identifier.
	 * @param {object} [options={}] Per-plant overrides.
	 * @returns {object} Standard plant nature result.
	 */
	plant(species, options = {}) {
		return this.vegetation.plant(species, options);
	}

	/**
	 * Generates one canonical tree through the shared forest facade.
	 * @param {string|object} preset Tree preset or configuration.
	 * @param {object} [options={}] Per-tree overrides.
	 * @returns {object} Standard tree nature result.
	 */
	tree(preset, options = {}) {
		return this.forests.tree(preset, options);
	}

	/**
	 * Creates one bounded river runtime through the shared water facade.
	 * @param {string|object} [preset='river'] Named flow preset or direct options.
	 * @param {object} [options={}] Per-river overrides.
	 * @returns {object} Standard river-runtime nature result.
	 */
	river(preset = 'river', options = {}) {
		return this.water.river(preset, options);
	}

	/**
	 * Plans one coupled ecosystem from shared habitat evidence.
	 * @param {object} [options={}] Ecosystem planning options.
	 * @returns {object} Standard ecosystem nature result.
	 */
	world(options = {}) {
		return this.ecosystems.plan(options);
	}

	/**
	 * Creates a new immutable NatureApi with selected defaults changed.
	 * @param {object} [overrides={}] Seed, quality, or realism overrides.
	 * @returns {NatureApi} New independent API instance.
	 */
	with(overrides = {}) {
		return new NatureApi({
			...this.defaults,
			...overrides
		});
	}
}

/**
 * Creates the high-level direct procedural nature API.
 * @param {object} [options={}] Shared seed, quality, and realism defaults.
 * @returns {NatureApi} Immutable nature API instance.
 */
export function createNatureApi(options = {}) {
	return new NatureApi(options);
}
