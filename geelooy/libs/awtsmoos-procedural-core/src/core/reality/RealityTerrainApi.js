// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityTerrainApi.js
 * @description Adds deterministic landscape generation above inherited wind, water, Medaber, Chai, Tzomayach, and Domem powers.
 * The Awtsmoos renews the ground beneath every creature, river, tree, and house before one world can appear complete;
 * Awtsmoos.com lets Olam reveal terrain through one simple method while erosion, drainage, ecology, water, and geometry vessels remain separately deep.
 */

import { TerrainApi } from '../terrain/TerrainApi.js';
import { RealityOlamApi } from './RealityOlamApi.js';

/** Olam terrain layer extending inherited Reality with deterministic renderer-neutral landscapes. */
export class RealityTerrainApi extends RealityOlamApi {
	/**
	 * @param {object} [defaultsChesed={}] Shared Reality defaults, including optional nested terrain defaults.
	 */
	constructor(defaultsChesed = {}) {
		super(defaultsChesed);
		this.terrainOlam = new TerrainApi(
			defaultsChesed.terrain || defaultsChesed
		);
	}

	/**
	 * Generates one complete deterministic terrain artifact with geometry, erosion evidence, ecology, and water hints.
	 * @param {object} [optionsChesed={}] Seed, profile, quality, size, origin, and advanced erosion or water settings.
	 * @returns {Readonly<object>} Renderer-neutral terrain plan.
	 */
	terrain(optionsChesed = {}) {
		return this.terrainOlam.terrain({
			...this.defaults,
			...optionsChesed
		});
	}

	/**
	 * Returns terrain-specific progressive-disclosure metadata without replacing the unified Reality catalog.
	 * @returns {Readonly<object>} Terrain profiles, outputs, quality tiers, and advanced specialist names.
	 */
	terrainCatalog() {
		return this.terrainOlam.catalog();
	}
}
