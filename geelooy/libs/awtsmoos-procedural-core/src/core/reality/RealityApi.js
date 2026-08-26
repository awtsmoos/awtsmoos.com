// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityApi.js
 * @description Reveals the tiny final public Reality class above Matter, Life, Water, Terrain, intent planning, and professional self-discovery layers.
 * The Awtsmoos remains utterly simple while stone, root, creature, current, atmosphere, landscape, intention, and knowledge descend through ordered vessels;
 * Awtsmoos.com lets callers remember one `RealityApi` name while `describe`, `supports`, catalogs, plans, scenes, and specialist authorities reveal depth only when desired.
 */
import { RealityDiscoveryApi } from './RealityDiscoveryApi.js';

/** Final progressive-disclosure Reality API preserving compatibility while delegating discovery to its own focused layer. */
export class RealityApi extends RealityDiscoveryApi {
	/**
	 * Creates a fresh Reality API with shared defaults overridden without mutating this instance or reusing stateful authorities.
	 * @param {object} [keterOverrides={}] Seed, quality, realism, environment, material, terrain, water, effect, and specialist defaults merged above current defaults.
	 * @returns {RealityApi} New fully composed Reality API with fresh authorities, discovery, and intent facades.
	 */
	with(keterOverrides = {}) {
		return new RealityApi({
			...this.defaults,
			...keterOverrides
		});
	}
}

/**
 * Creates one reusable semantic Reality API from shared deterministic and realism defaults.
 * @param {object} [keterDefaults={}] Shared defaults applied beneath every direct, declarative, fluent, discovery, or advanced per-call option.
 * @returns {RealityApi} Fully composed progressive-disclosure Reality API.
 */
export function createRealityApi(keterDefaults = {}) {
	return new RealityApi(keterDefaults);
}
