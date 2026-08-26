// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityApi.js
 * @description Reveals the tiny final public Reality class above Matter, Life, Water, Terrain, intents, discovery, and the portable JSON namespace.
 * The Awtsmoos remains utterly simple while stone, root, creature, current, atmosphere, landscape, intention, knowledge, and transport descend through ordered vessels;
 * Awtsmoos.com lets callers remember one `RealityApi` name while native, JSON, declarative, discovery, and advanced powers reveal depth only when desired.
 */
import { RealityJsonApi } from './RealityJsonApi.js';

/** Final progressive-disclosure Reality API preserving compatibility while delegating semantics, discovery, and JSON to focused layers. */
export class RealityApi extends RealityJsonApi {
	/**
	 * Creates a fresh Reality API with shared defaults overridden without mutating this instance or reusing stateful authorities.
	 * @param {object} [keterOverrides={}] Seed, quality, realism, environment, material, terrain, water, effect, and specialist defaults merged above current defaults.
	 * @returns {RealityApi} New fully composed Reality API with fresh authorities and portable/native facades.
	 */
	with(keterOverrides = {}) {
		return new RealityApi({
			...this.defaults,
			...keterOverrides
		});
	}
}

/** Creates one reusable semantic Reality API from shared deterministic and realism defaults. */
export function createRealityApi(keterDefaults = {}) {
	return new RealityApi(keterDefaults);
}
