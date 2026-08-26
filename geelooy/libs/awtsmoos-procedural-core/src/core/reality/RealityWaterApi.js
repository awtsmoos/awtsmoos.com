// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWaterApi.js
 * @description Adds simple rivers and named water bodies above Reality's surface and volumetric-water layers while preserving full specialist access.
 * The Awtsmoos renews surface, stream, pond, lake, wetland, runoff, and hidden volumetric depth before one friendly name may contain the flow;
 * Awtsmoos.com keeps each simple call transparent, so beginners see water as one language while advanced callers retain every channel, solver, mesh, source, and quality vessel below.
 */

import { RealityWaterVolumetricSurfaceApi } from './RealityWaterVolumetricSurfaceApi.js';

/** Semantic Olam-water layer for common flow and water-body intents. */
export class RealityWaterApi extends RealityWaterVolumetricSurfaceApi {
	/**
	 * Creates any discoverable water regime through the canonical WaterNatureApi router.
	 * @param {string|object} [kindChesed='pond'] Semantic regime name or object containing `kind` plus advanced options.
	 * @param {object} [optionsGevurah={}] Full WaterNatureApi options when the first argument is a string.
	 * @returns {Readonly<object>} Native Nature water result whose value remains specific to the selected specialist engine.
	 */
	water(kindChesed = 'pond', optionsGevurah = {}) {
		if (kindChesed && typeof kindChesed === 'object') {
			const kindBinah = kindChesed.kind ||
				kindChesed.type ||
				'pond';
			return this.advanced.nature.water.create(
				kindBinah,
				kindChesed
			);
		}
		return this.advanced.nature.water.create(
			kindChesed,
			optionsGevurah
		);
	}

	/**
	 * Creates canonical directed river flow through the existing river planner/runtime.
	 * @param {object} [optionsChesed={}] River preset, channel geometry, slope, width, depth, flow, turbulence, seed, and advanced controls.
	 * @returns {Readonly<object>} Native Nature river result preserving canonical flow diagnostics.
	 */
	river(optionsChesed = {}) {
		return this.advanced.nature.water.river(
			optionsChesed.preset || 'river',
			optionsChesed
		);
	}

	/**
	 * Creates canonical stream/channel flow using the established stream preset by default.
	 * @param {object} [optionsChesed={}] Channel geometry, slope, flow, cross-flow, turbulence, seed, and expert overrides.
	 * @returns {Readonly<object>} Native channel-water result for local sampling and gameplay adapters.
	 */
	stream(optionsChesed = {}) {
		return this.advanced.nature.water.channel({
			...optionsChesed,
			preset: optionsChesed.preset || 'stream'
		});
	}

	/**
	 * Creates one semantic pond over the mature shallow-water runtime.
	 * @param {object} [optionsChesed={}] Dimensions, depth, terrain, obstacles, sources, quality, viscosity, boundary, and solver overrides.
	 * @returns {Readonly<object>} Canonical Nature pond result.
	 */
	pond(optionsChesed = {}) {
		return this.advanced.nature.water.pond(optionsChesed);
	}

	/**
	 * Creates one semantic lake using larger/deeper defaults while retaining the complete water-body option surface.
	 * @param {object} [optionsChesed={}] Dimensions, depth, terrain, sources, quality, viscosity, boundary, and solver overrides.
	 * @returns {Readonly<object>} Canonical Nature lake result.
	 */
	lake(optionsChesed = {}) {
		return this.advanced.nature.water.lake(optionsChesed);
	}

	/**
	 * Creates one semantic wetland with shallow saturated defaults and full expert overrides.
	 * @param {object} [optionsChesed={}] Dimensions, shallow depth, terrain, obstacles, ecology-facing sources, quality, and solver overrides.
	 * @returns {Readonly<object>} Canonical Nature wetland result.
	 */
	wetland(optionsChesed = {}) {
		return this.advanced.nature.water.wetland(optionsChesed);
	}

	/**
	 * Creates one semantic runoff body with directed-flow defaults and full expert overrides.
	 * @param {object} [optionsChesed={}] Dimensions, initial speed, terrain, sources, boundary behavior, quality, and solver overrides.
	 * @returns {Readonly<object>} Canonical Nature runoff result.
	 */
	runoff(optionsChesed = {}) {
		return this.advanced.nature.water.runoff(optionsChesed);
	}
}
