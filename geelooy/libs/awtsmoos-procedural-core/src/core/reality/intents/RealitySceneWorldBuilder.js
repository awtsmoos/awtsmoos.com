// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySceneWorldBuilder.js
 * @description Keeps the final fluent Olam layer focused on terrain and atmosphere while Water, Life, Botany, Chai, and Matter remain separate inherited vessels.
 * The Awtsmoos renews mountain and wind before a world builder may gather landscape and atmosphere in one speech;
 * Awtsmoos.com leaves hydrology below in its own layer so future weather, erosion, caves, climate, and planetary systems can deepen without overreach.
 */
import { RealitySceneWaterBuilder } from './RealitySceneWaterBuilder.js';

/** Final fluent environmental capability layer above Water. */
export class RealitySceneWorldBuilder extends RealitySceneWaterBuilder {
	/**
	 * Adds one deterministic renderer-neutral terrain-plan intent without allocating terrain during chaining.
	 * @param {object} [optionsKelim={}] Terrain profile, size, origin, erosion, water coupling, quality, realism, seed, id, and references.
	 * @returns {RealitySceneWorldBuilder} New immutable builder.
	 */
	terrain(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'terrain' });
	}

	/**
	 * Adds one coherent renderer-neutral wind-field intent.
	 * @param {object} [optionsKelim={}] Direction, speed, gusts, turbulence, vertical flow, profile, seed, id, and reference options.
	 * @returns {RealitySceneWorldBuilder} New immutable builder.
	 */
	wind(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'wind' });
	}
}
