// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealitySceneWaterBuilder.js
 * @description Adds fluent semantic water composition above Life while every hydrology calculation remains inside canonical Nature water authorities.
 * The Awtsmoos renews pond, lake, wetland, runoff, river, and ocean before a scene may speak their flowing names;
 * Awtsmoos.com keeps water declarations transparent so simple worlds remain readable while shallow, channel, ocean, and fluid engines keep their deeper flames.
 */
import { RealitySceneLifeBuilder } from './RealitySceneLifeBuilder.js';

/** Fluent water capability layer over immutable scene intent state. */
export class RealitySceneWaterBuilder extends RealitySceneLifeBuilder {
	/**
	 * Adds one semantic pond intent over the canonical shallow-water-backed body runtime.
	 * @param {object} [optionsKelim={}] Dimensions, depth, terrain, obstacles, sources, profile, seed, id, and references.
	 * @returns {RealitySceneWaterBuilder} New immutable builder.
	 */
	pond(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'pond' });
	}

	/**
	 * Adds one semantic lake intent with larger/deeper defaults available beneath the same water-body authority.
	 * @param {object} [optionsKelim={}] Dimensions, depth, terrain, sources, profile, seed, id, and references.
	 * @returns {RealitySceneWaterBuilder} New immutable builder.
	 */
	lake(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'lake' });
	}

	/**
	 * Adds one shallow saturated wetland intent suitable for ecological composition.
	 * @param {object} [optionsKelim={}] Dimensions, water depth, terrain, sources, environment, profile, seed, id, and references.
	 * @returns {RealitySceneWaterBuilder} New immutable builder.
	 */
	wetland(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'wetland' });
	}

	/**
	 * Adds one directed surface-runoff intent through the existing shallow-water specialist.
	 * @param {object} [optionsKelim={}] Terrain, dimensions, initial flow, sources, boundaries, profile, seed, id, and references.
	 * @returns {RealitySceneWaterBuilder} New immutable builder.
	 */
	runoff(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'runoff' });
	}

	/**
	 * Adds one canonical river/channel intent without executing channel flow during chaining.
	 * @param {object} [optionsKelim={}] Channel geometry, slope, width, depth, flow, turbulence, profile, seed, id, and references.
	 * @returns {RealitySceneWaterBuilder} New immutable builder.
	 */
	river(optionsKelim = {}) {
		return this.add({ preset: 'river', ...optionsKelim, type: 'river' });
	}

	/**
	 * Adds one analytic ocean/tide/current intent.
	 * @param {object} [optionsKelim={}] Wave spectrum, tide, current, quality, realism, seed, id, and reference metadata.
	 * @returns {RealitySceneWaterBuilder} New immutable builder.
	 */
	ocean(optionsKelim = {}) {
		return this.add({ ...optionsKelim, type: 'ocean' });
	}
}
