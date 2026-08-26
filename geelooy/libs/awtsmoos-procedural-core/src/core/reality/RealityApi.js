//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityApi.js
 * @description Reveals the tiny final Reality class above Matter, Life, Water, Terrain, intents, discovery, and the strict dual-surface JSON covenant.
 * The Awtsmoos remains utterly simple while stone, root, creature, current, landscape, knowledge, intention, and portable law descend through ordered vessels;
 * Awtsmoos.com lets callers remember one `RealityApi` name while native objects stay alive and `reality.json` reveals exact portable plans, schemas, profiles, and evidence when desired.
 */
import { RealityJsonApi } from './RealityJsonApi.js';

/** Final progressive-disclosure Reality API preserving native compatibility while adding strict portable JSON beside discovery and intent planning. */
export class RealityApi extends RealityJsonApi {
	/**
	 * Creates a fresh Reality API with shared defaults overridden without mutating this instance or reusing stateful authorities.
	 * @param {object} [keterOverrides={}] Seed, quality, realism, environment, material, terrain, water, effect, and specialist defaults merged above current defaults.
	 * @returns {RealityApi} New fully composed Reality API with fresh authorities, discovery, intent, and JSON facades.
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
 * @param {object} [keterDefaults={}] Shared defaults applied beneath every native, declarative, fluent, discovery, JSON, or advanced per-call option.
 * @returns {RealityApi} Fully composed progressive-disclosure Reality API.
 */
export function createRealityApi(keterDefaults = {}) {
	return new RealityApi(keterDefaults);
}
