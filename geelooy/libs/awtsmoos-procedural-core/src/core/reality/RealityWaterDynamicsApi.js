// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWaterDynamicsApi.js
 * @description Adds raw shallow-water, full three-dimensional liquid, ocean, and biome doors above common semantic water bodies.
 * The Awtsmoos renews flood sheet, particle liquid, tide, and biome before advanced physics can seem separate from simple water intent;
 * Awtsmoos.com lets developers descend only when needed, while every heavy runtime remains the same canonical engine the expert API already meant.
 */
import { RealityWaterApi } from './RealityWaterApi.js';

/** Advanced-environment capability layer preserving native WaterNatureApi result contracts. */
export class RealityWaterDynamicsApi extends RealityWaterApi {
	/**
	 * Creates the canonical conservative shallow-water runtime directly.
	 * @param {object} [optionsChesed={}] Height/terrain/obstacle grids, solver, sources, rain, viscosity, boundaries, and expert stability options.
	 * @returns {object} Native Nature shallow-water result containing the mature runtime and its canonical diagnostics.
	 */
	shallow(optionsChesed = {}) {
		return this.advanced.nature.water.shallow(optionsChesed);
	}

	/**
	 * Creates the same conservative shallow-water runtime through the gameplay-oriented flood alias.
	 * @param {object} [optionsChesed={}] Complete shallow-water option surface including terrain, initial water, obstacles, sources, rain, solver, and quality controls.
	 * @returns {object} Native Nature shallow-water result; no alternate flood solver is introduced.
	 */
	flood(optionsChesed = {}) {
		return this.advanced.nature.water.flood(optionsChesed);
	}

	/**
	 * Creates the canonical stateful three-dimensional PIC/FLIP liquid runtime.
	 * @param {object} [optionsChesed={}] Bounds, particles, grid, solver, source, material, and expert liquid options.
	 * @returns {object} Native Nature three-dimensional liquid result using the existing PIC/FLIP authority.
	 */
	fluid(optionsChesed = {}) {
		return this.advanced.nature.water.fluid(optionsChesed);
	}

	/**
	 * Creates an immutable analytic ocean, tide, normal, foam, crest, and current field.
	 * @param {object} [optionsChesed={}] Gerstner-wave spectrum, tide, current, seed, quality, time-domain, and expert ocean controls.
	 * @returns {object} Native Nature ocean result exposing the canonical analytic field and its deterministic sampling contract.
	 */
	ocean(optionsChesed = {}) {
		return this.advanced.nature.water.ocean(optionsChesed);
	}

	/**
	 * Creates the same canonical analytic ocean through the familiar sea alias.
	 * @param {object} [optionsChesed={}] Complete option surface accepted by `ocean`.
	 * @returns {object} Native Nature ocean result; this alias does not construct a second sea engine.
	 */
	sea(optionsChesed = {}) {
		return this.advanced.nature.water.sea(optionsChesed);
	}

	/**
	 * Plans one canonical Nature biome/ecosystem through the existing Nature authority.
	 * @param {object} [optionsChesed={}] Biome identity, environment, species, density, seed, quality, realism, and specialist ecology intent.
	 * @returns {object} Native Nature biome result with specialist diagnostics and renderer-neutral population/world planning evidence.
	 */
	biome(optionsChesed = {}) {
		return this.advanced.nature.biome(optionsChesed);
	}
}
