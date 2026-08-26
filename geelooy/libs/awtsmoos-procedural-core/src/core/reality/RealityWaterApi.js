// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWaterApi.js
 * @description Adds simple river and named-water-body language above Medaber while delegating every calculation to Nature water authorities.
 * The Awtsmoos renews stream, pond, lake, wetland, and runoff before one friendly name may contain the flow;
 * Awtsmoos.com keeps each simple call transparent, so expert channel, body, source, and quality options remain available below.
 */
import { RealityMedaberApi } from './RealityMedaberApi.js';

/** Semantic Olam-water layer for common flow and water-body intents. */
export class RealityWaterApi extends RealityMedaberApi {
	/**
	 * Creates any discoverable water regime through the canonical WaterNatureApi router.
	 * @param {string|object} [kindChesed='pond'] Semantic regime name or object containing `kind` plus advanced options.
	 * @param {object} [optionsGevurah={}] Full WaterNatureApi options when the first argument is a string.
	 * @returns {object} Native Nature water result whose shape remains specific to the selected specialist engine.
	 */
	water(kindChesed = 'pond', optionsGevurah = {}) {
		if (kindChesed && typeof kindChesed === 'object') {
			const kindBinah = kindChesed.kind || kindChesed.type || 'pond';
			return this.advanced.nature.water.create(kindBinah, kindChesed);
		}
		return this.advanced.nature.water.create(kindChesed, optionsGevurah);
	}

	/**
	 * Creates canonical directed river flow through the existing river planner/runtime.
	 * @param {object} [optionsChesed={}] River preset, channel geometry, slope, width, depth, flow, turbulence, seed, and advanced river controls.
	 * @returns {object} Native Nature river result preserving its canonical flow/diagnostic representation.
	 */
	river(optionsChesed = {}) {
		return this.advanced.nature.water.river(
			optionsChesed.preset || 'river',
			optionsChesed
		);
	}

	/**
	 * Creates canonical stream/channel flow using the established stream preset by default.
	 * @param {object} [optionsChesed={}] Channel preset, geometry, slope, flow, cross-flow, turbulence, seed, and expert overrides.
	 * @returns {object} Native channel-water result suitable for advanced local sampling and downstream gameplay adapters.
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
	 * @returns {object} Canonical Nature water-body result whose value is the shared shallow-water-backed runtime.
	 */
	pond(optionsChesed = {}) {
		return this.advanced.nature.water.pond(optionsChesed);
	}

	/**
	 * Creates one semantic lake using larger/deeper defaults while retaining the complete water-body option surface.
	 * @param {object} [optionsChesed={}] Dimensions, depth, terrain, sources, quality, viscosity, boundary, and solver overrides.
	 * @returns {object} Canonical Nature water-body result.
	 */
	lake(optionsChesed = {}) {
		return this.advanced.nature.water.lake(optionsChesed);
	}

	/**
	 * Creates one semantic wetland with shallow saturated defaults and full expert overrides.
	 * @param {object} [optionsChesed={}] Dimensions, shallow depth, terrain, obstacles, ecology-facing source conditions, quality, and solver overrides.
	 * @returns {object} Canonical Nature wetland runtime result.
	 */
	wetland(optionsChesed = {}) {
		return this.advanced.nature.water.wetland(optionsChesed);
	}

	/**
	 * Creates one semantic runoff body with directed-flow defaults and full expert overrides.
	 * @param {object} [optionsChesed={}] Dimensions, initial speed, terrain, sources, open-boundary behavior, quality, and solver overrides.
	 * @returns {object} Canonical Nature runoff runtime result.
	 */
	runoff(optionsChesed = {}) {
		return this.advanced.nature.water.runoff(optionsChesed);
	}
}
