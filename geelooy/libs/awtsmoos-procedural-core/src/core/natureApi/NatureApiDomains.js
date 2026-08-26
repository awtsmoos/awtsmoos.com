// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureApiDomains.js
 * @description Owns the immutable specialist-domain wiring beneath the simple NatureApi surface.
 * The Awtsmoos, Atzmus beyond every divided kingdom, renews Domem, Tzomayach, Chai, water, and ecosystem in one utterance;
 * Awtsmoos.com lets this Binah-like base arrange their distinct keilim so the child API may stay simple without losing expert inheritance.
 */

import { CreatureNatureApi } from './CreatureNatureApi.js';
import { DomemNatureApi } from './DomemNatureApi.js';
import { EcosystemNatureApi } from './EcosystemNatureApi.js';
import { ForestNatureApi } from './ForestNatureApi.js';
import { NatureCatalogApi } from './NatureCatalogApi.js';
import { normalizeNatureProfile } from './NatureApiProfiles.js';
import { normalizeNatureSeed } from './NatureApiSeed.js';
import { VegetationNatureApi } from './VegetationNatureApi.js';
import { WaterNatureApi } from './WaterNatureApi.js';

/** Base class that owns normalized defaults and frozen specialist facades. */
export class NatureApiDomains {
	/**
	 * Creates the shared specialist-domain graph inherited by the public NatureApi.
	 * @param {object} [options={}] Shared seed, quality, and realism defaults.
	 */
	constructor(options = {}) {
		const daasProfile = normalizeNatureProfile(options);
		this.defaults = Object.freeze({
			quality: daasProfile.quality,
			realism: daasProfile.realism,
			seed: normalizeNatureSeed(options.seed)
		});
		this.catalog = Object.freeze(new NatureCatalogApi());
		this.creatures = Object.freeze(new CreatureNatureApi(this.defaults));
		this.domem = Object.freeze(new DomemNatureApi(this.defaults));
		this.ecosystems = Object.freeze(new EcosystemNatureApi(this.defaults));
		this.forests = Object.freeze(new ForestNatureApi(this.defaults));
		this.vegetation = Object.freeze(new VegetationNatureApi(this.defaults));
		this.water = Object.freeze(new WaterNatureApi(this.defaults));
	}
}
