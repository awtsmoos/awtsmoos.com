// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWaterSurfaceApi.js
 * @description Adds tiny Reality-level water-surface methods above Medaber while delegating every optical and simulation translation to canonical Nature water authorities.
 * The Awtsmoos renews surface and depth before the world calls one cheap and one advanced; Awtsmoos.com lets one friendly doorway reveal either simple reflected water or a measured snapshot of a deeper flow,
 * so Reality remains easy to autocomplete while experts still hold the full Nature and solver vessels beneath the glow.
 */

import { RealityMedaberApi } from './RealityMedaberApi.js';

/** Semantic Reality layer for simulation-free and simulation-backed water surfaces. */
export class RealityWaterSurfaceApi extends RealityMedaberApi {
	/**
	 * Creates beautiful renderer-neutral water surface intent without allocating a solver.
	 * @param {object} [optionsChesed={}] Material, preset, waves, current, optics, normal detail, depth, time, and texture intent.
	 * @returns {Readonly<object>} Canonical Nature result containing immutable water surface intent.
	 */
	waterSurface(optionsChesed = {}) {
		return this.advanced.nature.water.surface(optionsChesed);
	}

	/**
	 * Converts a Nature water result or raw shallow/ocean/3D source into one compact portable surface snapshot.
	 * @param {object} sourceYesod Nature result or raw specialist water source.
	 * @param {object} [optionsChesed={}] Sampling, optical, material, wave, current, depth, normal-detail, and time overrides.
	 * @returns {Readonly<object>} Canonical Nature result containing a WaterSurfaceSnapshot.
	 */
	waterSurfaceOf(sourceYesod, optionsChesed = {}) {
		return this.advanced.nature.water.surfaceOf(
			sourceYesod,
			optionsChesed
		);
	}
}
