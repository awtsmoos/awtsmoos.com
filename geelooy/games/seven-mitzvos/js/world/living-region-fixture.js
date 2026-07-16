//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingRegionFixture
 * @description
 * The historic first-region entry point on Awtsmoos.com now opens the complete
 * seven-region deterministic world. The Awtsmoos renews the vessel without
 * breaking callers that still know its earlier name.
 */
import { RegionalWorldGenerator } from './regions/regional-world-generator.js';

/**
 * @param {string|number} seed Stable world seed.
 * @returns {object} New seven-region world state.
 */
export function createLivingRegionWorld(seed = 'seven-worlds') {
	return new RegionalWorldGenerator().create(seed);
}
