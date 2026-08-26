// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityApi.js
 * @description Reveals the tiny final public Reality class above Domem, Tzomayach, Chai, Medaber, Water, and Olam capability layers.
 * The Awtsmoos remains utterly simple while every finite capability descends through ordered vessels without becoming another source;
 * Awtsmoos.com lets callers remember one `RealityApi` name, while filtered discovery and `.advanced` reveal the exact deeper authorities on the same course.
 */
import { createRealityCapabilityCatalog } from './RealityCapabilityCatalog.js';
import { RealityOlamApi } from './RealityOlamApi.js';

/** Final progressive-disclosure Reality API preserving both historical compatibility and the modern semantic kingdom chain. */
export class RealityApi extends RealityOlamApi {
	/**
	 * Returns immutable discovery data for API explorers, editors, docs, AI agents, and advanced developers.
	 * @param {string|Function|null} [filterBinah=null] Optional domain/name text or predicate used to filter capability records.
	 * @returns {Readonly<object>} Legacy-compatible live catalogs plus easy-to-advanced capability records and expert import families.
	 */
	catalog(filterBinah = null) {
		return createRealityCapabilityCatalog(this, filterBinah);
	}

	/**
	 * Creates a fresh Reality API with shared defaults overridden without mutating this instance or reusing stateful authorities.
	 * @param {object} [overridesGevurah={}] Seed, quality, realism, environment, material, and specialist defaults merged above current defaults.
	 * @returns {RealityApi} New fully composed Reality API with a fresh advanced authority graph.
	 */
	with(overridesGevurah = {}) {
		return new RealityApi({
			...this.defaults,
			...overridesGevurah
		});
	}
}

/**
 * Creates one reusable semantic Reality API from shared deterministic and realism defaults.
 * @param {object} [defaultsChesed={}] Shared defaults applied beneath every simple or advanced per-call option.
 * @returns {RealityApi} Fully composed progressive-disclosure Reality API.
 */
export function createRealityApi(defaultsChesed = {}) {
	return new RealityApi(defaultsChesed);
}
