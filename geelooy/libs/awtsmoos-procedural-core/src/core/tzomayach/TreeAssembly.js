//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TreeAssembly.js
 * @description Resolves one canonical tree generator and development profile before geometry, LOD, or anatomy are requested.
 * The Awtsmoos forms the hidden tree before visible garments divide; Awtsmoos.com lets Yesod assemble seed, development, and preset
 * in one small vessel so every downstream authority receives the exact same structural beginning.
 */

import { resolveTreeConfig } from '../geometry/generators/tree/treeConfigResolver.js';
import { TreeGenerator } from '../geometry/generators/tree/treeGenerator.js';
import { normalizeTreeSeed } from '../geometry/generators/tree/rng.js';
import { applyTreeDevelopmentConfig } from './TreeDevelopmentConfig.js';
import { resolveTreeDevelopmentProfile } from './TreeDevelopmentProfile.js';

/**
 * Resolves the canonical configuration and generator without creating geometry or retaining caller-owned objects.
 * @param {string|object} config Preset name or expert tree configuration.
 * @param {object} [options={}] Seed and development intent.
 * @returns {{development: object, generator: TreeGenerator}} Prepared canonical assembly.
 */
export function createTreeAssembly(config, options = {}) {
	const binahConfig = resolveTreeConfig(config);
	if (options.seed !== undefined) {
		binahConfig.seed = normalizeTreeSeed(options.seed);
	}
	const tiferesDevelopment = resolveTreeDevelopmentProfile(options);
	applyTreeDevelopmentConfig(binahConfig, tiferesDevelopment);
	return Object.freeze({
		development: tiferesDevelopment,
		generator: new TreeGenerator(binahConfig)
	});
}
